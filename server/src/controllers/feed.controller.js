import prisma from "../config/db.js";
import { io } from "../../server.js";
import path from "path";

// ─── GET FEED ────────────────────────────────────────
export const getFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { senderId: userId, status: "ACCEPTED" },
          { receiverId: userId, status: "ACCEPTED" },
        ],
      },
    });

    const connectedUserIds = connections.map((c) =>
      c.senderId === userId ? c.receiverId : c.senderId
    );

    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      orderBy: [{ createdAt: "desc" }],
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            currentTitle: true,
            companyName: true,
            role: true,
            experienceLevel: true,
            profilePicture: true,
          },
        },
        likes: { select: { userId: true } },
        comments: {
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                currentTitle: true,
                role: true,
              },
            },
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    const enriched = posts.map((post) => ({
      ...post,
      isLiked: post.likes.some((l) => l.userId === userId),
      isConnected: connectedUserIds.includes(post.author.id),
      isOwn: post.author.id === userId,
    }));

    res.json({ posts: enriched, page, hasMore: posts.length === limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── CREATE POST ─────────────────────────────────────
export const createPost = async (req, res) => {
  try {
    const { content, type } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!content && !image) {
      return res.status(400).json({ message: "Post content or image is required" });
    }

    const post = await prisma.post.create({
      data: {
        content: content || "",
        type: type || "UPDATE",
        image,
        authorId: req.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            currentTitle: true,
            companyName: true,
            role: true,
          },
        },
        likes: true,
        comments: true,
        _count: { select: { likes: true, comments: true } },
      },
    });

    res.status(201).json({ message: "Post created", post: { ...post, isLiked: false, isOwn: true } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── DELETE POST ─────────────────────────────────────
export const deletePost = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post || post.authorId !== req.user.id) {
      return res.status(404).json({ message: "Post not found" });
    }
    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── LIKE / UNLIKE POST ──────────────────────────────
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId: id, userId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { postId_userId: { postId: id, userId } } });
      await prisma.post.update({ where: { id }, data: { likesCount: { decrement: 1 } } });
      return res.json({ liked: false });
    }

    await prisma.like.create({ data: { postId: id, userId } });
    await prisma.post.update({ where: { id }, data: { likesCount: { increment: 1 } } });

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true }
    });
    
    if (post && post.authorId !== userId) {
      const liker = await prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true }
      });

      const notification = await prisma.notification.create({
        data: {
          recipientId: post.authorId,
          title: "Someone liked your post",
          message: `${liker.fullName} liked your post`,
          type: "LIKE",
          link: `/home?post=${id}#comments`,  // ← Add post ID to link
        },
      });

      io.to(post.authorId).emit("newNotification", notification);
    }

    res.json({ liked: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── ADD COMMENT ─────────────────────────────────────
export const addComment = async (req, res) => {
  try {
    const { content, parentId } = req.body; 
    const { id: postId } = req.params;
    const userId = req.user.id;

    if (!content) return res.status(400).json({ message: "Comment cannot be empty" });

    // 1. Create the comment
    const comment = await prisma.comment.create({
      data: { content, postId, authorId: userId, parentId: parentId || null },
      include: {
        author: { select: { fullName: true } }
      }
    });

    // 2. Notification Logic
    try {
      const snippet = `"${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`;
      const senderName = comment.author.fullName;

      if (parentId) {
        // --- REPLY SCENARIO: Notify the person you are replying to ---
        const parentComment = await prisma.comment.findUnique({
          where: { id: parentId },
          select: { authorId: true }
        });

        if (parentComment && parentComment.authorId !== userId) {
          const notification = await prisma.notification.create({
            data: {
              recipientId: parentComment.authorId,
              title: "New reply to your comment",
              message: `${senderName} replied: ${snippet}`,
              type: "COMMENT",
              link: `/home?post=${postId}#comments`
            }
          });
          io.to(parentComment.authorId).emit("newNotification", notification);
        }
      } else {
        // --- POST COMMENT SCENARIO: Notify the post owner ---
        const post = await prisma.post.findUnique({
          where: { id: postId },
          select: { authorId: true }
        });

        if (post && post.authorId !== userId) {
          const notification = await prisma.notification.create({
            data: {
              recipientId: post.authorId,
              title: "New comment on your post",
              message: `${senderName} commented: ${snippet}`,
              type: "COMMENT",
              link: `/home?post=${postId}#comments`
            }
          });
          io.to(post.authorId).emit("newNotification", notification);
        }
      }
    } catch (notifErr) {
      console.error("Notification failed:", notifErr);
    }

    res.status(201).json({ comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// ─── GET POST COMMENTS ───────────────────────────────
export const getComments = async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      
      where: { postId: req.params.id, parentId: null },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: { id: true, fullName: true, currentTitle: true, role: true, profilePicture: true },
        },
        
        replies: {
          include: {
            author: { select: { id: true, fullName: true, profilePicture: true } }
          },
          orderBy: { createdAt: "asc" }
        }
      },
    });
    res.json({ comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── DELETE COMMENT ──────────────────────────────────
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true }
    });

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Security: Only the comment author OR the post owner can delete it
    if (comment.authorId !== userId && comment.post.authorId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET USER POSTS ──────────────────────────────────
export const getUserPosts = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, fullName: true, currentTitle: true, role: true },
        },
        _count: { select: { likes: true, comments: true } },
        likes: { select: { userId: true } },
      },
    });

    const enriched = posts.map((p) => ({
      ...p,
      isLiked: p.likes.some((l) => l.userId === req.user.id),
      isOwn: p.authorId === req.user.id,
    }));

    res.json({ posts: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};