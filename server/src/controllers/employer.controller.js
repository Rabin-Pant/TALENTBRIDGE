import prisma from "../config/db.js";
import { io } from "../../server.js";

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
        requirements: requirements || [],
        benefits: benefits || [],
        skills: skills || [],
        employerId: req.user.id,
      },
    });

    res.status(201).json({ message: "Job posted successfully", job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── UPDATE JOB ──────────────────────────────────────
export const updateJob = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });

    if (!job || job.employerId !== req.user.id) {
      return res.status(404).json({ message: "Job not found" });
    }

    const {
      title, description, location, jobType,
      experienceLevel, industry, salaryMin, salaryMax,
      requirements, benefits, skills, status,
    } = req.body;

    const updated = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        title, description, location, jobType,
        experienceLevel, industry,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        requirements, benefits, skills, status,
      },
    });

    res.json({ message: "Job updated successfully", job: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── DELETE JOB ──────────────────────────────────────
export const deleteJob = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });

    if (!job || job.employerId !== req.user.id) {
      return res.status(404).json({ message: "Job not found" });
    }

    await prisma.job.delete({ where: { id: req.params.id } });

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET ALL APPLICANTS ──────────────────────────────
export const getApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { job: { employerId: req.user.id } },
      orderBy: { appliedAt: "desc" },
      include: {
        job: { select: { id: true, title: true, company: true } },
        applicant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            currentTitle: true,
            location: true,
            skills: true,
            experienceLevel: true,
            profilePicture: true,
          },
        },
      },
    });

    console.log(`Found ${applications.length} applications for employer ${req.user.id}`);
    res.json({ applications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET SINGLE APPLICATION ──────────────────────────
export const getApplicationById = async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        job: { select: { title: true, employerId: true } },
        applicant: {
          select: {
            fullName: true,
            email: true,
            currentTitle: true,
            bio: true,
            location: true,
            phone: true,
            skills: true,
            experienceLevel: true,
            resumeFileName: true,
            education: true,
            workExperience: true,
          },
        },
      },
    });

    if (!application || application.job.employerId !== req.user.id) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── UPDATE APPLICATION STATUS ───────────────────────
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, employerNote } = req.body;

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { job: true },
    });

    if (!application || application.job.employerId !== req.user.id) {
      return res.status(404).json({ message: "Application not found" });
    }

    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: { status, employerNote },
    });

    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        recipientId: application.applicantId,
        title: "Application Status Updated",
        message: `Your application for ${application.job.title} is now ${status}`,
        type: "STATUS_UPDATE",
        link: `/seeker/applications`,
      },
    });

    // Emit real-time notification via socket
    io.to(application.applicantId).emit("newNotification", notification);

    res.json({ message: "Status updated", application: updated });
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
        role: true,
        companyName: true,
        companyWebsite: true,
        companySize: true,
        industry: true,
        companyDescription: true,
        companyPhone: true,
        profilePicture: true,
        coverPicture: true,
        companyAddress: true,
        companyRegNumber: true,
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
    const { fullName, companyName, companyWebsite, companySize, industry, companyDescription } =
      req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { fullName, companyName, companyWebsite, companySize, industry, companyDescription },
      select: {
        id: true,
        email: true,
        fullName: true,
        companyName: true,
        companyWebsite: true,
        companySize: true,
        industry: true,
        companyDescription: true,
      },
    });

    res.json({ message: "Profile updated", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── NOTIFICATIONS ───────────────────────────────────
export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── MARK NOTIFICATIONS AS READ ──────────────────────
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
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Multer diskStorage has already automatically saved the file into "uploads/profiles/"
    // We save the relative sub-path so your frontend URL matches perfectly
    const profilePicturePath = `profiles/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePicture: profilePicturePath },
      select: { id: true, profilePicture: true }
    });

    return res.status(200).json({
      message: "Profile picture updated successfully!",
      profilePicture: updatedUser.profilePicture,
    });
  } catch (err) {
    console.error("Profile picture upload error:", err);
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

    // Multer diskStorage has already automatically saved the file into "uploads/profiles/"
    const coverPicturePath = `profiles/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { coverPicture: coverPicturePath },
      select: { id: true, coverPicture: true }
    });

    return res.status(200).json({
      message: "Cover picture updated successfully!",
      coverPicture: updatedUser.coverPicture,
    });
  } catch (err) {
    console.error("Cover picture upload error:", err);
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