import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ─── REGISTER ───────────────────────────────────────
export const register = async (req, res) => {
  try {
    const {
  email, password, fullName, role,
  phone, location, currentTitle, experienceLevel,
  companyName, companyWebsite, companySize, industry,
  companyDescription, companyRegNumber, companyAddress,
  companyPhone, companyDocument,
} = req.body;

    // Validate role
    const validRoles = ["SEEKER", "EMPLOYER"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Validate employer must provide company name
    if (role === "EMPLOYER" && !companyName) {
      return res.status(400).json({ message: "Company name is required for employers" });
    }

    // Hash password
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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── LOGIN ───────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if account is active
    if (!user.active) {
  return res.status(403).json({ message: "Your account has been disabled" });
}

// Check employer approval
if (user.role === "EMPLOYER" && !user.approved) {
  return res.status(403).json({ message: "Your employer account is pending admin approval. You will be notified once approved." });
}

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

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
    console.error(err);
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