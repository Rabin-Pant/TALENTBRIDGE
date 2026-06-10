import prisma from "../config/db.js";
import { io } from "../../server.js";
import { uploadToCloudinary } from "../middleware/upload.middleware.js";

// ─── GET ALL MY JOBS ─────────────────────────────────
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { employerId: req.user.id },
      orderBy: { postedAt: "desc" },
      include: {
        _count: { select: { applications: true } },
      },
    });

    res.json({ jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── POST JOB ────────────────────────────────────────
export const createJob = async (req, res) => {
  try {
    const {
      title, description, location, jobType,
      experienceLevel, industry, salaryMin, salaryMax,
      requirements, benefits, skills,
    } = req.body;

    const employer = await prisma.user.findUnique({ where: { id: req.user.id } });

    const job = await prisma.job.create({
      data: {
        title,
        description,
        company: employer.companyName || employer.fullName,
        location,
        jobType,
        experienceLevel,
        industry,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        requirements: typeof requirements === "string" ? requirements.split("\n") : requirements,
        benefits: typeof benefits === "string" ? benefits.split("\n") : benefits,
        skills: typeof skills === "string" ? skills.split(",").map(s => s.trim()) : skills,
        employerId: req.user.id,
      },
    });

    res.status(201).json({ message: "Job created successfully", job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── UPDATE JOB ──────────────────────────────────────
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, location, jobType,
      experienceLevel, industry, salaryMin, salaryMax,
      requirements, benefits, skills, status,
    } = req.body;

    const job = await prisma.job.findFirst({
      where: { id, employerId: req.user.id },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title,
        description,
        location,
        jobType,
        experienceLevel,
        industry,
        status,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        requirements: typeof requirements === "string" ? requirements.split("\n") : requirements,
        benefits: typeof benefits === "string" ? benefits.split("\n") : benefits,
        skills: typeof skills === "string" ? skills.split(",").map(s => s.trim()) : skills,
      },
    });

    res.json({ message: "Job updated successfully", job: updatedJob });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── DELETE JOB ──────────────────────────────────────
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findFirst({
      where: { id, employerId: req.user.id },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    await prisma.job.delete({ where: { id } });

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET JOB APPLICANTS ──────────────────────────────
export const getApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: {
        job: { employerId: req.user.id },
      },
      orderBy: { appliedAt: "desc" },
      include: {
        job: { select: { title: true } },
        applicant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            resumeFileName: true,
          },
        },
      },
    });

    res.json({ applications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET APPLICANT DETAIL BY ID ─────────────────────
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findFirst({
      where: {
        id,
        job: { employerId: req.user.id },
      },
      include: {
        job: { select: { title: true, id: true } },
        applicant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            bio: true,
            currentTitle: true,
            location: true,
            skills: true,
            education: true,
            workExperience: true,
            resumeFileName: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── UPDATE APPLICATION STATUS ────────────────────────
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    if (!["PENDING", "REVIEWING", "SHORTLISTED", "REJECTED", "ACCEPTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const application = await prisma.application.findFirst({
      where: {
        id,
        job: { employerId: req.user.id },
      },
      include: {
        job: { select: { title: true } },
      },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status, feedback: feedback || null },
    });

    const notification = await prisma.notification.create({
      data: {
        recipientId: application.applicantId,
        title: `Application Status Update: ${status}`,
        message: `Your application status for "${application.job.title}" has been updated to ${status}.`,
        type: "APPLICATION",
        link: "/seeker/applications",
      },
    });

    if (io) {
      io.to(application.applicantId).emit("newNotification", notification);
    }

    res.json({ message: "Application status updated successfully", application: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET PROFILE ─────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        companyName: true,
        companyWebsite: true,
        companyDescription: true,
        industry: true,
        companySize: true,
        location: true,
        phone: true,
        profilePicture: true,
        coverPicture: true,
      },
    });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── UPDATE PROFILE ──────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const {
      fullName, companyName, companyWebsite,
      companyDescription, industry, companySize, location, phone,
    } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fullName, companyName, companyWebsite,
        companyDescription, industry, companySize, location, phone,
      },
    });

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET NOTIFICATIONS ───────────────────────────────
export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── MARK ALL NOTIFICATIONS READ ─────────────────────
export const markNotificationsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { recipientId: req.user.id, read: false },
      data: { read: true },
    });

    res.json({ message: "Notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── MARK SINGLE NOTIFICATION AS READ ────────────────
export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, recipientId: userId },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── DELETE SINGLE NOTIFICATION ──────────────────────
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, recipientId: userId },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await prisma.notification.delete({ where: { id: notificationId } });

    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── DELETE ALL NOTIFICATIONS ────────────────────────
export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.deleteMany({
      where: { recipientId: userId },
    });

    res.json({ message: "All notifications deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── MARK ALL NOTIFICATIONS AS READ ──────────────────
export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { recipientId: userId, read: false },
      data: { read: true },
    });

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── UPLOAD PROFILE PICTURE ─────────────────────────
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized. Please log in again." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, "profiles");

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePicture: imageUrl },
      select: { id: true, profilePicture: true }
    });

    return res.status(200).json({
      message: "Profile picture updated successfully!",
      profilePicture: updatedUser.profilePicture,
    });

  } catch (err) {
    console.error("Upload profile picture error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── DELETE PROFILE PICTURE ─────────────────────────
export const deleteProfilePicture = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePicture: null },
      select: { id: true, profilePicture: true }
    });

    res.json({ message: "Profile picture removed", profilePicture: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── UPLOAD COVER PICTURE ─────────────────────────
export const uploadCoverPicture = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, "profiles");

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { coverPicture: imageUrl },
      select: { id: true, coverPicture: true }
    });

    return res.status(200).json({
      message: "Cover picture updated successfully!",
      coverPicture: updatedUser.coverPicture,
    });

  } catch (err) {
    console.error("Upload cover picture error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── DELETE COVER PICTURE ─────────────────────────
export const deleteCoverPicture = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { coverPicture: null },
      select: { id: true, coverPicture: true }
    });

    res.json({ message: "Cover picture removed", coverPicture: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};