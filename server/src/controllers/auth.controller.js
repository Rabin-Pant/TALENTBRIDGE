import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

// ─── SECURITY HELPER FUNCTIONS ─────────────────────────
const sanitizeInput = (input) => {
  if (!input) return null;
  return String(input)
    .trim()
    .replace(/[<>'"]/g, '')  // Remove dangerous characters
    .slice(0, 255);          // Limit length
};

const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail|protonmail)\.com$/;
  return emailRegex.test(email);
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ─── REGISTER (WITH SECURITY) ─────────────────────────
export const register = async (req, res) => {
  try {
    let {
      email, password, fullName, role,
      phone, location, currentTitle, experienceLevel,
      companyName, companyWebsite, companySize, industry,
      companyDescription, companyRegNumber, companyAddress,
      companyPhone, companyDocument,
    } = req.body;

    // ─── INPUT SANITIZATION ─────────────────────────────
    email = email ? email.toLowerCase().trim() : null;
    fullName = sanitizeInput(fullName);
    phone = sanitizeInput(phone);
    location = sanitizeInput(location);
    currentTitle = sanitizeInput(currentTitle);
    companyName = sanitizeInput(companyName);
    companyWebsite = sanitizeInput(companyWebsite);
    companyDescription = sanitizeInput(companyDescription);
    companyRegNumber = sanitizeInput(companyRegNumber);
    companyAddress = sanitizeInput(companyAddress);
    companyPhone = sanitizeInput(companyPhone);

    // ─── VALIDATION ─────────────────────────────────────
    // Validate role
    const validRoles = ["SEEKER", "EMPLOYER"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Validate email format
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format. Use gmail, yahoo, outlook, or hotmail" });
    }

    // Validate full name
    if (!fullName || fullName.length < 3) {
      return res.status(400).json({ message: "Full name must be at least 3 characters" });
    }
    if (!/^[a-zA-Z\s]+$/.test(fullName)) {
      return res.status(400).json({ message: "Full name can only contain letters and spaces" });
    }

    // Validate phone number format (Nepal format)
    if (phone && !/^(97|98)\d{8}$/.test(phone)) {
      return res.status(400).json({ message: "Phone number must start with 97 or 98 and be 10 digits" });
    }

    // Validate password strength
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (!/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      return res.status(400).json({ message: "Password must contain both letters and numbers" });
    }

    // Validate location
    if (location && !/^[a-zA-Z\s,.-]+$/.test(location)) {
      return res.status(400).json({ message: "Location contains invalid characters" });
    }

    // Validate employer company name
    if (role === "EMPLOYER" && !companyName) {
      return res.status(400).json({ message: "Company name is required for employers" });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password with higher salt rounds for security
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role,
        approved: role === "SEEKER" ? true : false,
        phone: phone || null,
        location: location || null,
        currentTitle: currentTitle || null,
        experienceLevel: experienceLevel || null,
        companyName: role === "EMPLOYER" ? companyName : null,
        companyWebsite: companyWebsite || null,
        companySize: companySize || null,
        industry: industry || null,
        companyDescription: companyDescription || null,
        companyRegNumber: companyRegNumber || null,
        companyAddress: companyAddress || null,
        companyPhone: companyPhone || null,
        companyDocument: companyDocument || null,
      },
    });

    // Log registration (for audit)
    console.log(`[AUDIT] New user registered: ${email} (${role})`);

    // Employer — return pending approval (no token)
    if (role === "EMPLOYER") {
      return res.status(201).json({
        message: "Registration successful! Your account is pending admin approval.",
        pendingApproval: true,
      });
    }

    // Seeker — return token immediately
    const token = generateToken(user);
    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        companyName: user.companyName,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── LOGIN ────────────────────────────
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Input sanitization
    email = email ? email.toLowerCase().trim() : null;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Return 401 for invalid credentials (triggers rate limit)
    if (!user) {
      console.log(`[SECURITY] Failed login attempt for email: ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if account is active
    if (!user.active) {
      return res.status(403).json({ message: "Your account has been disabled. Please contact support." });
    }

    // Check employer approval
    if (user.role === "EMPLOYER" && !user.approved) {
      return res.status(403).json({ message: "Your employer account is pending admin approval." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[SECURITY] Failed password attempt for: ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    console.log(`[AUDIT] User logged in: ${email} (${user.role})`);

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        companyName: user.companyName,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET ME ──────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        active: true,
        currentTitle: true,
        bio: true,
        location: true,
        phone: true,
        experienceLevel: true,
        skills: true,
        resumeFileName: true,
        companyName: true,
        companyWebsite: true,
        companySize: true,
        industry: true,
        companyDescription: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};