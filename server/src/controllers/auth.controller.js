import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import crypto from "crypto";

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ─── HELPER FUNCTIONS ───────────────────────────────────
const sanitizeInput = (input) => {
  if (!input) return null;
  return String(input)
    .trim()
    .replace(/[<>'"]/g, '')
    .slice(0, 255);
};

const isValidEmail = (email) => {
 // strictly allow only gmail, yahoo, outlook, and hotmail
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail)\.com$/;
  return emailRegex.test(email);
};

// ─── REGISTER ─────────────────────────────────────────
export const register = async (req, res) => {
  try {
    let {
      email, password, fullName, role,
      phone, location, currentTitle, experienceLevel,
      companyName, companyWebsite, companySize, industry,
      companyDescription, companyRegNumber, companyAddress,
      companyPhone, companyDocument,
    } = req.body;

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

    const validRoles = ["SEEKER", "EMPLOYER"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!fullName || fullName.length < 3) {
      return res.status(400).json({ message: "Full name must be at least 3 characters" });
    }
    if (!/^[a-zA-Z\s]+$/.test(fullName)) {
      return res.status(400).json({ message: "Full name can only contain letters and spaces" });
    }

    if (phone && !/^(97|98)\d{8}$/.test(phone)) {
      return res.status(400).json({ message: "Phone number must start with 97 or 98 and be 10 digits" });
    }

    if (role === "EMPLOYER" && companyPhone && !/^(97|98)\d{8}$/.test(companyPhone)) {
      return res.status(400).json({ message: "Company phone number must start with 97 or 98 and be exactly 10 digits" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (!/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      return res.status(400).json({ message: "Password must contain both letters and numbers" });
    }

    if (location && !/^[a-zA-Z\s,.-]+$/.test(location)) {
      return res.status(400).json({ message: "Location contains invalid characters" });
    }

    if (role === "EMPLOYER" && !companyName) {
      return res.status(400).json({ message: "Company name is required for employers" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

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

    console.log(`[AUDIT] New user registered: ${email} (${role})`);

    if (role === "EMPLOYER") {
      return res.status(201).json({
        message: "Registration successful! Your account is pending admin approval.",
        pendingApproval: true,
      });
    }

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
         profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── LOGIN ───────────────────────────────────────────
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email ? email.toLowerCase().trim() : null;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log(`[SECURITY] Failed login attempt for email: ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.active) {
      return res.status(403).json({ message: "Your account has been disabled. Please contact support." });
    }

    if (user.role === "EMPLOYER" && !user.approved) {
      return res.status(403).json({ message: "Your employer account is pending admin approval." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[SECURITY] Failed password attempt for: ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

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
        profilePicture: user.profilePicture,
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
        profilePicture: true,  
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── CHANGE PASSWORD (In-app, requires current password) ───
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password cannot be the same as current password" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    console.log(`[AUDIT] User ${user.email} changed their password`);

    res.json({ message: "Password changed successfully!" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── CHECK IF EMAIL EXISTS ──────────────────────────
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: email?.toLowerCase() },
    });
    res.json({ exists: !!user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── DIRECT RESET PASSWORD (Without email token) ─────
export const resetPasswordDirect = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    console.log(`[AUDIT] User ${email} reset their password`);

    res.json({ message: "Password reset successfully! You can now login." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Save to database
    const contact = await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });

    // Send real-time notification to all admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", active: true },
      select: { id: true },
    });

    for (const admin of admins) {
      // Save notification
      await prisma.notification.create({
        data: {
          recipientId: admin.id,
          title: "New Contact Message",
          message: `${name} sent a message: "${subject}"`,
          type: "SYSTEM",
          link: "/admin/contacts",
        },
      });

      // Real-time socket notification
      const { io } = await import("../../server.js");
      io.to(admin.id).emit("newNotification", {
        title: "New Contact Message",
        message: `${name} sent a message: "${subject}"`,
      });
    }

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ message: "Failed to send message. Please try again." });
  }
};