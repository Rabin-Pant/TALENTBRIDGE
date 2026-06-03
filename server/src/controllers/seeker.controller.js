import prisma from "../config/db.js";

// ─── DASHBOARD ───────────────────────────────────────
export const getDashboard = async (req, res) => {
  try {
    const seekerId = req.user.id;

    const [totalApplications, pending, shortlisted, accepted, recentApplications] =
      await Promise.all([
        prisma.application.count({ where: { applicantId: seekerId } }),
        prisma.application.count({ where: { applicantId: seekerId, status: "PENDING" } }),
        prisma.application.count({ where: { applicantId: seekerId, status: "SHORTLISTED" } }),
        prisma.application.count({ where: { applicantId: seekerId, status: "ACCEPTED" } }),
        prisma.application.findMany({
          where: { applicantId: seekerId },
          take: 5,
          orderBy: { appliedAt: "desc" },
          include: { job: { select: { title: true, company: true, location: true } } },
        }),
      ]);

    res.json({ totalApplications, pending, shortlisted, accepted, recentApplications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

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

    // Check job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== "ACTIVE") {
      return res.status(404).json({ message: "Job not found or closed" });
    }

    // Check already applied
    const existing = await prisma.application.findUnique({
      where: { jobId_applicantId: { jobId, applicantId: seekerId } },
    });
    if (existing) {
      return res.status(400).json({ message: "You already applied to this job" });
    }

    // Get seeker resume
    const seeker = await prisma.user.findUnique({ where: { id: seekerId } });

    const application = await prisma.application.create({
      data: {
        jobId,
        applicantId: seekerId,
        coverLetter,
        resumeSnapshot: seeker.resumeFileName,
      },
    });

    // Notify employer
    await prisma.notification.create({
      data: {
        recipientId: job.employerId,
        title: "New Application",
        message: `${seeker.fullName} applied for ${job.title}`,
        type: "APPLICATION",
        link: `/employer/applications/${application.id}`,
      },
    });

    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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

    // Mark all as read
    await prisma.notification.updateMany({
      where: { recipientId: req.user.id, read: false },
      data: { read: true },
    });

    res.json({ notifications, unreadCount });
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