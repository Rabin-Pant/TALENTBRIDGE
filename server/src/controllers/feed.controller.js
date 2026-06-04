import prisma from "../config/db.js";
import path from "path";

// ─── GET FEED ────────────────────────────────────────
export const getFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Get user's connections
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

    // Get posts — connections first then everyone
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

    // Add isLiked and isConnected flags
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

    // Notify post author
    const post = await prisma.post.findUnique({ where: { id } });
    if (post && post.authorId !== userId) {
      const liker = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } });
      await prisma.notification.create({
        data: {
          recipientId: post.authorId,
          title: "Someone liked your post",
          message: `${liker.fullName} liked your post`,
          type: "SYSTEM",
          link: `/home`,
        },
      });
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
    const { content } = req.body;
    const { id } = req.params;

    if (!content) return res.status(400).json({ message: "Comment cannot be empty" });

    const comment = await prisma.comment.create({
      data: { content, postId: id, authorId: req.user.id },
      include: {
        author: {
          select: { id: true, fullName: true, currentTitle: true, role: true },
        },
      },
    });

    // Notify post author
    const post = await prisma.post.findUnique({ where: { id } });
    if (post && post.authorId !== req.user.id) {
      await prisma.notification.create({
        data: {
          recipientId: post.authorId,
          title: "New comment on your post",
          message: `${comment.author.fullName} commented on your post`,
          type: "SYSTEM",
          link: `/home`,
        },
      });
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
      where: { postId: req.params.id },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: { id: true, fullName: true, currentTitle: true, role: true },
        },
      },
    });
    res.json({ comments });
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