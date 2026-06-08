import prisma from "../config/db.js";

// Helper function to sanitize search input
const sanitizeSearchInput = (input) => {
  if (!input) return undefined;
  // Remove potentially dangerous characters and limit length
  return String(input)
    .trim()
    .replace(/[<>'"]/g, '')  // Remove <, >, ', "
    .slice(0, 100);          // Limit to 100 characters
};

// Helper function to validate pagination parameters
const validatePagination = (page, limit) => {
  const validatedPage = Math.max(1, parseInt(page) || 1);
  const validatedLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
  return { page: validatedPage, limit: validatedLimit };
};

// ─── GET LANDING PAGE STATS ──────────────────────────
export const getLandingStats = async (req, res) => {
  try {
    console.log("Fetching landing page stats...");
    
    // Get counts
    const totalUsers = await prisma.user.count();
    const totalSeekers = await prisma.user.count({ where: { role: "SEEKER" } });
    const totalEmployers = await prisma.user.count({ where: { role: "EMPLOYER" } });
    const activeJobs = await prisma.job.count({ where: { status: "ACTIVE" } });
    const totalApplications = await prisma.application.count();
    const acceptedApplications = await prisma.application.count({ where: { status: "ACCEPTED" } });

    console.log("Stats:", {
      totalUsers,
      totalSeekers,
      totalEmployers,
      activeJobs,
      totalApplications,
      acceptedApplications
    });

    // Get recent jobs
    const recentJobs = await prisma.job.findMany({
      take: 6,
      where: { status: "ACTIVE" },
      orderBy: { postedAt: "desc" },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        jobType: true,
        postedAt: true,
      },
    });

    // Get testimonials from real users
    const usersWithJobs = await prisma.user.findMany({
      where: {
        role: "SEEKER",
        applications: {
          some: {
            status: "ACCEPTED"
          }
        }
      },
      take: 3,
      select: {
        id: true,
        fullName: true,
        currentTitle: true,
        profilePicture: true,
        applications: {
          where: { status: "ACCEPTED" },
          take: 1,
          include: {
            job: {
              select: { company: true, title: true }
            }
          }
        }
      }
    });

    let testimonials = [];
    
    if (usersWithJobs.length > 0) {
      testimonials = usersWithJobs.map(user => ({
        name: user.fullName,
        role: user.currentTitle || "Professional",
        company: user.applications[0]?.job?.company || "a Company",
        content: `"TalentBridge helped me land a position at ${user.applications[0]?.job?.company || "a great company"}! The platform made my job search easy and effective."`,
        rating: 5,
        profilePicture: user.profilePicture
      }));
    } else {
      // Fallback testimonials using existing users
      const existingUsers = await prisma.user.findMany({
        where: { role: "SEEKER" },
        take: 3,
        select: { id: true, fullName: true, currentTitle: true }
      });
      
      if (existingUsers.length > 0) {
        testimonials = existingUsers.map(user => ({
          name: user.fullName,
          role: user.currentTitle || "Job Seeker",
          company: "Various Companies",
          content: "TalentBridge is a great platform for finding job opportunities!",
          rating: 5,
          profilePicture: null
        }));
      } else {
        testimonials = [
          {
            name: "Rabin Pant",
            role: "Full Stack Developer",
            company: "Tech Solutions",
            content: "TalentBridge helped me find my dream job! The platform is amazing.",
            rating: 5,
            profilePicture: null
          }
        ];
      }
    }

    res.json({
      stats: {
        totalJobs: activeJobs || 0,
        totalSeekers: totalSeekers || 0,
        totalEmployers: totalEmployers || 0,
        totalHires: acceptedApplications || 0,
      },
      testimonials,
      recentJobs: recentJobs || [],
    });
  } catch (err) {
    console.error("Landing stats error:", err);
    res.status(500).json({ 
      stats: {
        totalJobs: 0,
        totalSeekers: 0,
        totalEmployers: 0,
        totalHires: 0,
      },
      testimonials: [],
      recentJobs: [],
      error: err.message 
    });
  }
};

// ─── DASHBOARD ───────────────────────────────────────
export const getDashboard = async (req, res) => {
  try {
    // Get date from 30 days ago
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    // Run all queries in parallel
    const [
      totalUsers,
      totalSeekers,
      totalEmployers,
      activeJobs,
      totalApplications,
      acceptedApplications,
      users30DaysAgo,
      seekers30DaysAgo,
      employers30DaysAgo,
      activeJobs30DaysAgo,
      applications30DaysAgo,
      accepted30DaysAgo,
      pendingEmployers,
    ] = await Promise.all([
      // Current totals
      prisma.user.count(),
      prisma.user.count({ where: { role: "SEEKER" } }),
      prisma.user.count({ where: { role: "EMPLOYER" } }),
      prisma.job.count({ where: { status: "ACTIVE" } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: "ACCEPTED" } }),
      
      // Totals from 30 days ago
      prisma.user.count({ where: { createdAt: { lt: thirtyDaysAgo } } }),
      prisma.user.count({ where: { role: "SEEKER", createdAt: { lt: thirtyDaysAgo } } }),
      prisma.user.count({ where: { role: "EMPLOYER", createdAt: { lt: thirtyDaysAgo } } }),
      prisma.job.count({ where: { status: "ACTIVE", postedAt: { lt: thirtyDaysAgo } } }),
      prisma.application.count({ where: { appliedAt: { lt: thirtyDaysAgo } } }),
      prisma.application.count({ where: { status: "ACCEPTED", appliedAt: { lt: thirtyDaysAgo } } }),
      
      // Pending employers
      prisma.user.count({ where: { role: "EMPLOYER", approved: false } }),
    ]);
    
    // Calculate percentage change
    const calculateTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      const change = ((current - previous) / previous) * 100;
      return Math.round(change * 10) / 10;
    };
    
    res.json({
      totalUsers,
      totalSeekers,
      totalEmployers,
      activeJobs,
      totalApplications,
      acceptedApplications,
      trends: {
        users: calculateTrend(totalUsers, users30DaysAgo),
        seekers: calculateTrend(totalSeekers, seekers30DaysAgo),
        employers: calculateTrend(totalEmployers, employers30DaysAgo),
        jobs: calculateTrend(activeJobs, activeJobs30DaysAgo),
        applications: calculateTrend(totalApplications, applications30DaysAgo),
        accepted: calculateTrend(acceptedApplications, accepted30DaysAgo),
      },
      insights: {
        pendingEmployers: pendingEmployers || 0,
      },
      periodInfo: {
        comparisonDays: 30,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET ALL USERS (WITH SECURE SEARCH & PAGINATION) ──
export const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    
    // Build filters
    const filters = {};
    
    // Role filter with validation
    if (role && ["SEEKER", "EMPLOYER", "ADMIN"].includes(role)) {
      filters.role = role;
    }
    
    // Secure search functionality
    if (search && search.trim()) {
      const sanitizedSearch = sanitizeSearchInput(search);
      if (sanitizedSearch) {
        filters.OR = [
          { fullName: { contains: sanitizedSearch, mode: 'insensitive' } },
          { email: { contains: sanitizedSearch, mode: 'insensitive' } },
          { companyName: { contains: sanitizedSearch, mode: 'insensitive' } }
        ];
      }
    }
    
    // Pagination with validation
    const { page: validatedPage, limit: validatedLimit } = validatePagination(page, limit);
    const skip = (validatedPage - 1) * validatedLimit;
    
    // Get total count for pagination
    const totalUsers = await prisma.user.count({ where: filters });
    
    // Get paginated users
    const users = await prisma.user.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      skip,
      take: validatedLimit,
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
    
    const processedUsers = users.map(user => ({
      ...user,
      email: user.email || null,
      phone: user.phone || user.companyPhone || null,
    }));

    res.json({ 
      users: processedUsers,
      pagination: {
        currentPage: validatedPage,
        totalPages: Math.ceil(totalUsers / validatedLimit),
        totalUsers,
        hasMore: validatedPage * validatedLimit < totalUsers
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET SINGLE USER (WITH ID VALIDATION) ────────────
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format (assuming you're using UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const user = await prisma.user.findUnique({
      where: { id },
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
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── TOGGLE USER ACTIVE STATUS ───────────────────────
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.id === req.user.id) {
      return res.status(400).json({ message: "Cannot disable your own account" });
    }

    // 💡 Toggles your original boolean column 'active' between true and false
    const updated = await prisma.user.update({
      where: { id },
      data: { active: !user.active },
      select: { id: true, fullName: true, active: true },
    });

    console.log(`Admin ${req.user.id} ${updated.active ? "enabled" : "disabled"} user ${updated.id}`);

    res.json({
      message: `User ${updated.active ? "enabled" : "disabled"} successfully`,
      user: updated, // Sends back { id, fullName, active }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── DELETE USER (WITH CASCADE HANDLING) ─────────────
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    // Delete in transaction to ensure data consistency
    await prisma.$transaction(async (prisma) => {
      // Delete related notifications
      await prisma.notification.deleteMany({ where: { recipientId: id } });
      
      // Delete related applications
      await prisma.application.deleteMany({ where: { applicantId: id } });
      
      // If employer, delete their jobs and related applications
      if (user.role === "EMPLOYER") {
        const jobs = await prisma.job.findMany({ where: { employerId: id }, select: { id: true } });
        const jobIds = jobs.map(job => job.id);
        
        if (jobIds.length > 0) {
          await prisma.application.deleteMany({ where: { jobId: { in: jobIds } } });
          await prisma.job.deleteMany({ where: { employerId: id } });
        }
      }
      
      // Finally delete the user
      await prisma.user.delete({ where: { id } });
    });

    // Log the action
    console.log(`Admin ${req.user.id} deleted user ${id}`);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET ALL JOBS (WITH SEARCH & PAGINATION) ─────────
export const getAllJobs = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    
    // Build filters
    const filters = {};
    
    // Status filter
    if (status && ["ACTIVE", "CLOSED", "DRAFT"].includes(status)) {
      filters.status = status;
    }
    
    // Secure search
    if (search && search.trim()) {
      const sanitizedSearch = sanitizeSearchInput(search);
      if (sanitizedSearch) {
        filters.OR = [
          { title: { contains: sanitizedSearch, mode: 'insensitive' } },
          { company: { contains: sanitizedSearch, mode: 'insensitive' } },
          { employer: { fullName: { contains: sanitizedSearch, mode: 'insensitive' } } }
        ];
      }
    }
    
    // Pagination
    const { page: validatedPage, limit: validatedLimit } = validatePagination(page, limit);
    const skip = (validatedPage - 1) * validatedLimit;
    
    const totalJobs = await prisma.job.count({ where: filters });
    
    const jobs = await prisma.job.findMany({
      where: filters,
      orderBy: { postedAt: "desc" },
      skip,
      take: validatedLimit,
      include: {
        employer: { select: { id: true, fullName: true, companyName: true, email: true } },
        _count: { select: { applications: true } },
      },
    });
    
    res.json({ 
      jobs,
      pagination: {
        currentPage: validatedPage,
        totalPages: Math.ceil(totalJobs / validatedLimit),
        totalJobs,
        hasMore: validatedPage * validatedLimit < totalJobs
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── DELETE JOB (WITH CASCADE) ───────────────────────
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ message: "Invalid job ID format" });
    }
    
    const job = await prisma.job.findUnique({ where: { id } });

    if (!job) return res.status(404).json({ message: "Job not found" });

    // Delete in transaction
    await prisma.$transaction(async (prisma) => {
      // Delete all applications for this job
      await prisma.application.deleteMany({ where: { jobId: id } });
      // Delete the job
      await prisma.job.delete({ where: { id } });
    });

    // Log the action
    console.log(`Admin ${req.user.id} deleted job ${id}`);

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET ALL APPLICATIONS (WITH SEARCH & PAGINATION) ──
export const getAllApplications = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    
    // Build filters
    const filters = {};
    
    // Status filter
    if (status && ["PENDING", "REVIEWING", "SHORTLISTED", "ACCEPTED", "REJECTED"].includes(status)) {
      filters.status = status;
    }
    
    // Secure search
    if (search && search.trim()) {
      const sanitizedSearch = sanitizeSearchInput(search);
      if (sanitizedSearch) {
        filters.OR = [
          { applicant: { fullName: { contains: sanitizedSearch, mode: 'insensitive' } } },
          { job: { title: { contains: sanitizedSearch, mode: 'insensitive' } } },
          { job: { company: { contains: sanitizedSearch, mode: 'insensitive' } } }
        ];
      }
    }
    
    // Pagination
    const { page: validatedPage, limit: validatedLimit } = validatePagination(page, limit);
    const skip = (validatedPage - 1) * validatedLimit;
    
    const totalApplications = await prisma.application.count({ where: filters });
    
    const applications = await prisma.application.findMany({
      where: filters,
      orderBy: { appliedAt: "desc" },
      skip,
      take: validatedLimit,
      include: {
        job: { select: { id: true, title: true, company: true, location: true } },
        applicant: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });
    
    res.json({ 
      applications,
      pagination: {
        currentPage: validatedPage,
        totalPages: Math.ceil(totalApplications / validatedLimit),
        totalApplications,
        hasMore: validatedPage * validatedLimit < totalApplications
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── SEND NOTIFICATION TO USER (WITH VALIDATION) ─────
export const sendNotification = async (req, res) => {
  try {
    const { recipientId, title, message, link } = req.body;
    
    // Validate required fields
    if (!recipientId || !title || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Validate and sanitize inputs
    const sanitizedTitle = sanitizeSearchInput(title)?.slice(0, 100);
    const sanitizedMessage = sanitizeSearchInput(message)?.slice(0, 500);
    const sanitizedLink = link ? sanitizeSearchInput(link)?.slice(0, 200) : null;
    
    // Validate recipient exists
    const recipient = await prisma.user.findUnique({ 
      where: { id: recipientId },
      select: { id: true, email: true, fullName: true }
    });
    
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    const notification = await prisma.notification.create({
  data: {
    recipientId: user.id,
    title: "Account Approved!",
    message: "Your employer account has been approved. You can now post jobs and hire talent.",
    type: "SYSTEM",
    link: "/home",
  },
});

    // Log the action
    console.log(`Admin ${req.user.id} sent notification to ${recipientId}`);

    res.status(201).json({ message: "Notification sent", notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── APPROVE EMPLOYER (WITH SECURITY CHECKS) ─────────
export const approveEmployer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const user = await prisma.user.findUnique({ 
      where: { id },
      select: { id: true, role: true, approved: true, email: true, fullName: true }
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.role !== "EMPLOYER") {
      return res.status(400).json({ message: "User is not an employer" });
    }
    
    if (user.approved) {
      return res.status(400).json({ message: "Employer is already approved" });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { approved: true },
      select: { id: true, fullName: true, approved: true }
    });

    // Send notification to employer
    await prisma.notification.create({
      data: {
        recipientId: user.id,
        title: "Account Approved! 🎉",
        message: "Your employer account has been approved. You can now post jobs and start hiring top talent on TalentBridge.",
        type: "SYSTEM",
        link: "/employer/dashboard",
      },
    });

    // Log the action
    console.log(`Admin ${req.user.id} approved employer ${user.id} (${user.email})`);

    res.json({ 
      message: "Employer approved successfully", 
      user: updated 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET USER STATISTICS ───────────────────────
export const getUserStatistics = async (req, res) => {
  try {
    const stats = await prisma.$transaction([
      prisma.user.count({ where: { active: true } }),
      prisma.user.count({ where: { active: false } }),
      prisma.user.count({ where: { role: "SEEKER", approved: true } }),
      prisma.user.count({ where: { role: "EMPLOYER", approved: false } }),
    ]);
    
    res.json({
      activeUsers: stats[0],
      inactiveUsers: stats[1],
      verifiedSeekers: stats[2],
      pendingEmployers: stats[3]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET SINGLE JOB BY ID ───────────────────────────
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        employer: {
          select: {
            fullName: true,
            companyName: true,
            email: true,
            companyWebsite: true,
          },
        },
        _count: { select: { applications: true } },
      },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getContactMessages = async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    const unreadCount = messages.filter((m) => !m.read).length;
    res.json({ messages, unreadCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const markContactRead = async (req, res) => {
  try {
    await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteContact = async (req, res) => {
  try {
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { 
            id: true,          
            fullName: true, 
            role: true, 
            email: true, 
            profilePicture: true 
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });
    res.json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const adminDeletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({ 
      where: { id },
      select: {
        id: true,
        authorId: true, 
        content: true
      }
    });
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const contentSnippet = post.content.length > 30 
      ? `"${post.content.slice(0, 30)}..."` 
      : `"${post.content}"`;

    const warningMessage = `Warning: Your post containing ${contentSnippet} was removed by administration for violating community guidelines. Repeated violations may result in account suspension.`;

    await prisma.notification.create({
      data: {
        userId: post.authorId,
        title: "Content Removal Warning",
        message: warningMessage,
        type: "SYSTEM", 
      },
    });

    await prisma.post.delete({ where: { id } });

    res.json({ message: "Post successfully moderated and warning notification dispatched." });
  } catch (err) {
    console.error("Error in adminDeletePost moderation flow:", err);
    res.status(500).json({ message: "Server error during content deletion" });
  }
};