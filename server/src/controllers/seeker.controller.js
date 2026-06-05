import prisma from "../config/db.js";
import { io } from "../../server.js";

// ─── BROWSE JOBS ─────────────────────────────────────
export const getJobs = async (req, res) => {
  try {
    const { keyword, location, jobType, experience, industry } = req.query;

    const filters = { status: "ACTIVE" };

    if (location) filters.location = { contains: location, mode: "insensitive" };
    if (jobType) filters.jobType = jobType;
    if (experience) filters.experienceLevel = experience;
    if (industry) filters.industry = { contains: industry, mode: "insensitive" };
    if (keyword) {
      filters.OR = [
        { title: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
        { company: { contains: keyword, mode: "insensitive" } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where: filters,
      orderBy: { postedAt: "desc" },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        jobType: true,
        experienceLevel: true,
        industry: true,
        salaryMin: true,
        salaryMax: true,
        skills: true,
        postedAt: true,
      },
    });

    res.json({ jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── JOB DETAIL ──────────────────────────────────────
export const getJobById = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        employer: {
          select: {
            fullName: true,
            companyName: true,
            companyWebsite: true,
            companyDescription: true,
            industry: true,
            companySize: true,
          },
        },
      },
    });

    if (!job || job.status !== "ACTIVE") {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── APPLY TO JOB ────────────────────────────────────
export const applyToJob = async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const seekerId = req.user.id;
    const jobId = req.params.id;

    console.log("Application started for job:", jobId);
    console.log("File received:", req.file);
    console.log("Cover letter:", coverLetter);

    // Handle resume file
    let resumeFileName = null;
    if (req.file) {
      // Resume uploaded during application
      resumeFileName = req.file.filename;
      console.log("New resume uploaded:", resumeFileName);
    } else {
      // Check if user has existing resume
      const seeker = await prisma.user.findUnique({
        where: { id: seekerId },
        select: { resumeFileName: true }
      });
      resumeFileName = seeker?.resumeFileName;
      console.log("Using existing resume:", resumeFileName);
    }

    // Check if resume exists
    if (!resumeFileName) {
      return res.status(400).json({ message: "Please upload your resume" });
    }

    // Check job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (job.status !== "ACTIVE") {
      return res.status(400).json({ message: "Job is not active" });
    }

    // Check already applied
    const existing = await prisma.application.findFirst({
      where: { 
        jobId: jobId, 
        applicantId: seekerId 
      },
    });
    
    if (existing) {
      return res.status(400).json({ message: "You already applied to this job" });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        applicantId: seekerId,
        coverLetter: coverLetter || null,
        resumeSnapshot: resumeFileName,
      },
    });

    console.log("Application created:", application.id);

    // Get seeker info for notification
    const seeker = await prisma.user.findUnique({
      where: { id: seekerId },
      select: { fullName: true, email: true }
    });

    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        recipientId: job.employerId,
        title: "New Application Received!",
        message: `${seeker.fullName} applied for ${job.title}`,
        type: "APPLICATION",
        link: `/employer/applications/${application.id}`,
      },
    });

    console.log("Notification created:", notification.id);

    // Emit real-time notification via socket
    if (io) {
      io.to(job.employerId).emit("newNotification", notification);
    }

    res.status(201).json({ 
      message: "Application submitted successfully", 
      application 
    });
  } catch (err) {
    console.error("Apply to job error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ─── MY APPLICATIONS ─────────────────────────────────
export const getMyApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { applicantId: req.user.id },
      orderBy: { appliedAt: "desc" },
      include: {
        job: {
          select: {
            title: true,
            company: true,
            location: true,
            jobType: true,
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

// ─── GET PROFILE ─────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        currentTitle: true,
        bio: true,
        location: true,
        phone: true,
        experienceLevel: true,
        skills: true,
        resumeFileName: true,
        education: true,
        workExperience: true,
         profilePicture: true,  
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
      fullName,
      currentTitle,
      bio,
      location,
      experienceLevel,
      skills,
      education,
      workExperience,
    } = req.body;

    // Build update data carefully
    const updateData = {};

    if (fullName !== undefined)       updateData.fullName       = fullName;
    if (currentTitle !== undefined)   updateData.currentTitle   = currentTitle;
    if (bio !== undefined)            updateData.bio            = bio;
    if (location !== undefined)       updateData.location       = location;
    if (experienceLevel !== undefined && experienceLevel !== "") {
      updateData.experienceLevel = experienceLevel;
    }
    if (skills !== undefined) {
      updateData.skills = typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : skills;
    }
    if (education !== undefined)      updateData.education      = education;
    if (workExperience !== undefined) updateData.workExperience = workExperience;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        currentTitle: true,
        bio: true,
        location: true,
        phone: true,
        experienceLevel: true,
        skills: true,
        resumeFileName: true,
        education: true,
        workExperience: true,
      },
    });

    res.json({ message: "Profile updated", user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── UPLOAD RESUME ───────────────────────────────────
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { resumeFileName: req.file.filename },
    });

    res.json({ message: "Resume uploaded successfully", filename: req.file.filename });
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

export const updateContact = async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { phone },
      select: { id: true, phone: true },
    });
    res.json({ message: "Contact updated", user });
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
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Store the relative path
    const profilePicturePath = `profiles/${req.file.filename}`;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePicture: profilePicturePath },
      select: { id: true, profilePicture: true }
    });

    res.json({ 
      message: "Profile picture uploaded successfully", 
      profilePicture: user.profilePicture 
    });
  } catch (err) {
    console.error("Upload profile picture error:", err);
    res.status(500).json({ message: "Server error" });
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
    console.error("Delete profile picture error:", err);
    res.status(500).json({ message: "Server error" });
  }
};