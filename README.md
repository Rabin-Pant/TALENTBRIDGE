# TalentBridge — Job Portal Platform

<div align="center">

![TalentBridge](https://img.shields.io/badge/TalentBridge-Job%20Portal-blue?style=for-the-badge)

**Connect Talent with Opportunity**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=flat&logo=socket.io)](https://socket.io/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [User Roles](#-user-roles)
- [Security](#-security)
- [License](#-license)

---

## 🎯 Overview

TalentBridge is a full-stack job portal platform that connects job seekers with employers through a modern, LinkedIn-inspired interface. It features real-time messaging, job posting, application tracking, social networking, and a comprehensive admin dashboard.

### Key Highlights

- 🚀 **Real-time messaging** with Socket.io (WhatsApp/Messenger style)
- 📱 **Fully responsive** design for mobile and desktop
- 🔐 **Secure authentication** with JWT + rate limiting
- 📊 **Admin dashboard** with platform-wide analytics
- 💼 **Job posting and application management**
- 👥 **Professional network** with connection requests
- 🔔 **Real-time notifications** via Socket.io
- 📄 **Resume and profile picture** upload
- 🔍 **Advanced search and filtering**
- 📝 **Social feed** with posts, likes, and comments
- ✅ **Employer verification** with document upload

---

## ✨ Features

### 👨‍💼 Job Seekers
- Browse and search jobs with filters (keyword, location, type, experience, industry)
- Apply to jobs with cover letter
- Track application status (Pending → Reviewing → Shortlisted → Accepted/Rejected)
- Build professional network with connection requests
- Real-time messaging with employers and connections
- Create and manage profile (bio, skills, education, work experience)
- Upload resume (PDF/DOC) and profile picture
- Receive real-time notifications for application updates
- Post updates, achievements, and job updates on the social feed

### 🏢 Employers
- Register with company verification (PAN card / registration documents)
- Post and manage job listings with full details
- View and filter applicants with LinkedIn-style profiles
- Update application statuses with feedback/notes
- Real-time messaging with candidates
- Company profile management
- Receive real-time notifications for new applications
- Post company announcements on the social feed

### 👑 Admin
- Platform overview dashboard with live analytics
- User management (view full details, enable/disable, delete)
- Employer verification and approval system
- Job listing moderation and deletion
- Application monitoring across all users
- Feed post moderation and deletion
- Contact message inbox from users
- Send system notifications to any user

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Framework |
| Vite | 8.x | Build Tool |
| Tailwind CSS | 3.x | Styling |
| React Router DOM | 6.x | Client-side Routing |
| React Hook Form | 7.x | Form Management |
| Lucide React | latest | Icons |
| Socket.io Client | 4.x | Real-time Communication |
| Axios | 1.x | HTTP API Calls |
| date-fns | 3.x | Date Formatting |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 24.x | Runtime |
| Express | 5.x | Web Framework |
| Prisma | 5.x | ORM |
| PostgreSQL | 18.x | Database |
| Socket.io | 4.x | Real-time Communication |
| jsonwebtoken | 9.x | Authentication |
| bcryptjs | 3.x | Password Hashing |
| multer | 2.x | File Upload |
| express-rate-limit | 7.x | Rate Limiting |

---

## 📁 Project Structure

```
TalentBridge/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── employer/
│   │   │   ├── seeker/
│   │   │   ├── shared/
│   │   │   └── static/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── routes/
│   ├── uploads/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- Node.js v20+
- PostgreSQL v15+
- npm

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Rabin-Pant/TALENTBRIDGE.git
cd TalentBridge
```

### Step 2 — Install Backend Dependencies

```bash
cd server
npm install
```

### Step 3 — Install Frontend Dependencies

```bash
cd ../client
npm install
```

### Step 4 — Set Up Environment Variables

Create `.env` inside the `server/` folder (see [Environment Variables](#-environment-variables)).

### Step 5 — Run Database Migration

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### Step 6 — Create Upload Directories

```bash
mkdir -p uploads/resumes uploads/profiles uploads/posts uploads/documents
```

### Step 7 — Create Admin Account

```bash
node -e "
import('./src/config/db.js').then(async ({ default: prisma }) => {
  const bcrypt = await import('bcryptjs');
  const hash = await bcrypt.default.hash('admin123', 12);
  await prisma.user.create({
    data: { email: 'admin@talentbridge.com', password: hash, fullName: 'Super Admin', role: 'ADMIN', approved: true }
  });
  console.log('Admin created successfully');
  process.exit(0);
});
"
```

---

## 🔧 Environment Variables

Create a `.env` file inside `server/`:

```env
# Server
PORT=5000

# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/talentbridge"

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## 🏃 Running the Application

### Development

Start the backend (Terminal 1):
```bash
cd server
npm run dev
```

Start the frontend (Terminal 2):
```bash
cd client
npm run dev
```

Then open: **http://localhost:5173**

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@talentbridge.com | admin123 |

### Production Build

```bash
# Build frontend
cd client
npm run build

# Start backend
cd ../server
npm start
```

---

## 👤 User Roles

| Role | Access | Registration |
|------|--------|-------------|
| **Seeker** | Browse jobs, apply, social feed, messaging | Instant |
| **Employer** | Post jobs, manage applicants, social feed | Requires admin approval |
| **Admin** | Full platform management | Manual creation only |

---

## 🔒 Security

- JWT authentication with 7-day expiration
- Password hashing with bcrypt (12 rounds)
- Rate limiting on login (5 attempts / 15 min) and registration (3 / hour)
- Input sanitization to prevent XSS
- SQL injection protection via Prisma ORM
- CORS restricted to frontend origin
- Role-based access control on all protected routes
- Employer account requires admin verification before access

---

## 📄 License

MIT License — feel free to use this project for learning and personal projects.

---

<div align="center">
Made with ❤️ by <strong>Rabin Pant</strong>
</div>