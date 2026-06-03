import prisma from "../config/db.js";

// ─── DASHBOARD ───────────────────────────────────────
export const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalSeekers,
      totalEmployers,
      activeJobs,
      totalApplications,
      acceptedApplications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "SEEKER" } }),
      prisma.user.count({ where: { role: "EMPLOYER" } }),
      prisma.job.count({ where: { status: "ACTIVE" } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: "ACCEPTED" } }),
    ]);

    res.json({
      totalUsers,
      totalSeekers,
      totalEmployers,
      activeJobs,
      totalApplications,
      acceptedApplications,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET ALL USERS ───────────────────────────────────
export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filters = {};
    if (role) filters.role = role;

    const users = await prisma.user.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, email: true, fullName: true,
        role: true, active: true, approved: true,
        phone: true, location: true, bio: true,
        currentTitle: true, experienceLevel: true,
        skills: true, resumeFileName: true,
        companyName: true, companyWebsite: true,
        companySize: true, industry: true,
        companyDescription: true, companyAddress: true,
        companyPhone: true, companyRegNumber: true,
        companyDocument: true, createdAt: true, lastLogin: true,
      },
    });

    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── TOGGLE USER ACTIVE STATUS ───────────────────────
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent admin from disabling themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ message: "Cannot disable your own account" });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { active: !user.active },
      select: { id: true, fullName: true, active: true },
    });

    res.json({
      message: `User ${updated.active ? "enabled" : "disabled"} successfully`,
      user: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── DELETE USER ─────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    await prisma.user.delete({ where: { id: req.params.id } });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET ALL JOBS ────────────────────────────────────
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { postedAt: "desc" },
      include: {
        employer: { select: { fullName: true, companyName: true } },
        _count: { select: { applications: true } },
      },
    });

    res.json({ jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── DELETE JOB ──────────────────────────────────────
export const deleteJob = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });

    if (!job) return res.status(404).json({ message: "Job not found" });

    await prisma.job.delete({ where: { id: req.params.id } });

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET ALL APPLICATIONS ────────────────────────────
export const getAllApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { appliedAt: "desc" },
      include: {
        job: { select: { title: true, company: true } },
        applicant: { select: { fullName: true, email: true } },
      },
    });

    res.json({ applications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── SEND NOTIFICATION TO USER ───────────────────────
export const sendNotification = async (req, res) => {
  try {
    const { recipientId, title, message, link } = req.body;

    // Check recipient exists
    const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
    if (!recipient) return res.status(404).json({ message: "Recipient not found" });

    const notification = await prisma.notification.create({
      data: {
        recipientId,
        title,
        message,
        type: "SYSTEM",
        link,
      },
    });

    res.status(201).json({ message: "Notification sent", notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── APPROVE EMPLOYER ────────────────────────────────
export const approveEmployer = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "EMPLOYER") return res.status(400).json({ message: "User is not an employer" });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { approved: true },
    });

    // Notify employer
    await prisma.notification.create({
      data: {
        recipientId: user.id,
        title: "Account Approved!",
        message: "Your employer account has been approved. You can now post jobs and hire talent.",
        type: "SYSTEM",
        link: "/employer/dashboard",
      },
    });

    res.json({ message: "Employer approved successfully", user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};