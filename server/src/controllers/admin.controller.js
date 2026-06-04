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
    
    // Sanitize email addresses in response (hide part of email for privacy)
    const sanitizedUsers = users.map(user => ({
      ...user,
      email: user.email ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null,
      phone: user.phone ? user.phone.replace(/(.{3})(.*)(.{2})/, '$1***$3') : null,
    }));

    res.json({ 
      users: sanitizedUsers,
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
    
    // Validate ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent admin from disabling themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ message: "Cannot disable your own account" });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { active: !user.active },
      select: { id: true, fullName: true, active: true },
    });

    // Log the action (for audit trail)
    console.log(`Admin ${req.user.id} ${updated.active ? "enabled" : "disabled"} user ${updated.id}`);

    res.json({
      message: `User ${updated.active ? "enabled" : "disabled"} successfully`,
      user: updated,
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
        recipientId,
        title: sanitizedTitle,
        message: sanitizedMessage,
        type: "SYSTEM",
        link: sanitizedLink,
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

// ─── GET USER STATISTICS (NEW) ───────────────────────
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