import prisma from "../config/db.js";

// ─── SEARCH USERS ─────────────────────────────────────
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.id;

    if (!q || q.length < 2) {
      return res.json({ users: [] });
    }

    // Search for users - EXCLUDE ADMIN role
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: { not: userId },
          },
          {
            role: { not: "ADMIN" }, 
          },
          {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { companyName: { contains: q, mode: "insensitive" } },
              { currentTitle: { contains: q, mode: "insensitive" } },
            ],
          },
          {
            active: true,
          },
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

    // Get connection status for each user
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        const connection = await prisma.connection.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: user.id },
              { senderId: user.id, receiverId: userId },
            ],
          },
        });

        return {
          ...user,
          connectionStatus: connection?.status || "NONE",
          connectionId: connection?.id || null,
          isSender: connection?.senderId === userId,
        };
      })
    );

    res.json({ users: usersWithStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};