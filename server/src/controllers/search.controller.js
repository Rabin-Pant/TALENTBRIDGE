import prisma from "../config/db.js";

// ─── SEARCH USERS (SECURE & OPTIMIZED) ─────────────────
export const searchUsers = async (req, res) => {
  try {
    let { q } = req.query;
    const userId = req.user.id;

    if (!q || q.trim().length < 2) {
      return res.json({ users: [] });
    }

    q = q.trim();
    
    // --- SECURITY LAYER: Boundary Constraint ---
    if (q.length > 100) {
      return res.status(400).json({ message: "Search query too long" });
    }

    // Search for users - EXCLUDE ADMIN role
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          { role: { not: "ADMIN" } },
          {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { companyName: { contains: q, mode: "insensitive" } },
              { currentTitle: { contains: q, mode: "insensitive" } },
            ],
          },
          { active: true },
        ],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        currentTitle: true,
        companyName: true,
        location: true,
        industry: true,
        profilePicture: true,
      },
      take: 20,
    });

    // --- OPTIMIZATION: Fix N+1 Query Problem ---
    // Extract all found user IDs to perform exactly ONE connection query
    const userIds = users.map((u) => u.id);

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: { in: userIds } },
          { senderId: { in: userIds }, receiverId: userId },
        ],
      },
    });

    // Map connection statuses in-memory (0 extra DB hits)
    const usersWithStatus = users.map((user) => {
      const connection = connections.find(
        (c) =>
          (c.senderId === userId && c.receiverId === user.id) ||
          (c.senderId === user.id && c.receiverId === userId)
      );

      return {
        ...user,
        connectionStatus: connection?.status || "NONE",
        connectionId: connection?.id || null,
        isSender: connection?.senderId === userId,
      };
    });

    res.json({ users: usersWithStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};