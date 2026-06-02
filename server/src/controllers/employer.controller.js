import prisma from "../config/db.js";

// ─── DASHBOARD ───────────────────────────────────────
export const getDashboard = async (req, res) => {
  try {
    const employerId = req.user.id;

    const [totalJobs, activeJobs, totalApplications, recentApplications] =
      await Promise.all([
        prisma.job.count({ where: { employerId } }),
        prisma.job.count({ where: { employerId, status: "ACTIVE" } }),
        prisma.application.count({
          where: { job: { employerId } },
        }),
        prisma.application.findMany({
          where: { job: { employerId } },
          take: 5,
          orderBy: { appliedAt: "desc" },
          include: {
            job: { select: { title: true } },
            applicant: { select: { fullName: true, currentTitle: true } },
          },
        }),
      ]);

    res.json({ totalJobs, activeJobs, totalApplications, recentApplications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

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
        job: { select: { title: true } },
        applicant: {
          select: {
            fullName: true,
            currentTitle: true,
            location: true,
            skills: true,
            experienceLevel: true,
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

    // Notify seeker of status change
    await prisma.notification.create({
      data: {
        recipientId: application.applicantId,
        title: "Application Status Updated",
        message: `Your application for ${application.job.title} is now ${status}`,
        type: "STATUS_UPDATE",
        link: `/seeker/applications`,
      },
    });

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
        companyName: true,
        companyWebsite: true,
        companySize: true,
        industry: true,
        companyDescription: true,
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