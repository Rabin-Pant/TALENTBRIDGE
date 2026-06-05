# TalentBridge - Job Portal Platform

<div align="center">

![TalentBridge Logo](https://via.placeholder.com/150x150?text=TalentBridge)

**Connect Talent with Opportunity**

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1.svg)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC.svg)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-010101.svg)](https://socket.io/)

</div>

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

TalentBridge is a full-stack job portal platform that connects job seekers with employers. It features real-time messaging, job posting, application tracking, and an admin dashboard for platform management.

### Key Highlights

- 🚀 **Real-time messaging** with Socket.io
- 📱 **Responsive design** for mobile and desktop
- 🔐 **Secure authentication** with JWT
- 📊 **Admin dashboard** with analytics
- 💼 **Job posting and application management**
- 👥 **Network building** with connection requests
- 🔔 **Real-time notifications**
- 📄 **Resume upload and management**
- 🖼️ **Profile picture upload**
- 🔍 **Advanced search and filtering**

## ✨ Features

### 👨‍💼 Job Seekers
- Browse and search jobs with filters
- Apply to jobs with resume upload
- Track application status
- Build professional network
- Real-time messaging with employers
- Create and manage profile
- Upload resume and profile picture
- Receive notifications for application updates
- Post updates and achievements

### 🏢 Employers
- Post and manage job listings
- View and filter applicants
- Update application statuses
- Leave feedback for applicants
- Real-time messaging with candidates
- Company profile management
- Receive notifications for new applications
- Post company updates

### 👑 Admin
- Platform overview dashboard with analytics
- User management (view, enable, disable, delete)
- Employer verification and approval
- Job listing moderation
- Application monitoring
- Send system notifications
- View platform statistics

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Framework |
| Vite | 5.x | Build Tool |
| Tailwind CSS | 3.x | Styling |
| React Router DOM | 6.x | Routing |
| React Hook Form | 7.x | Form Management |
| Lucide React | 0.x | Icons |
| Socket.io Client | 4.x | Real-time Communication |
| Axios | 1.x | API Calls |
| date-fns | 3.x | Date Formatting |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | Runtime |
| Express | 4.x | Web Framework |
| Prisma | 5.x | ORM |
| PostgreSQL | 15.x | Database |
| Socket.io | 4.x | Real-time Communication |
| JWT | 9.x | Authentication |
| Bcryptjs | 2.x | Password Hashing |
| Multer | 1.x | File Upload |
| Express Rate Limit | 7.x | Rate Limiting |

## 📁 Project Structure
```
TalentBridge/
├── client/ # React Frontend
│ ├── src/
│ │ ├── api/ # API configuration
│ │ │ ├── axios.js # Axios instance
│ │ │ └── socket.js # Socket.io client
│ │ ├── components/ # Reusable components
│ │ │ ├── Navbar.jsx # Navigation bar
│ │ │ ├── Sidebar.jsx # Sidebar menu
│ │ │ ├── ProtectedRoute.jsx # Route protection
│ │ │ └── AnimatedBackground.jsx # Background animations
│ │ ├── context/ # React context
│ │ │ └── AuthContext.jsx # Authentication context
│ │ ├── pages/ # Page components
│ │ │ ├── auth/ # Authentication pages
│ │ │ │ ├── Login.jsx
│ │ │ │ ├── Register.jsx
│ │ │ │ ├── ResetPassword.jsx
│ │ │ │ └── ChangePassword.jsx
│ │ │ ├── shared/ # Shared pages
│ │ │ │ ├── Home.jsx
│ │ │ │ ├── Network.jsx
│ │ │ │ ├── Messages.jsx
│ │ │ │ └── PublicProfile.jsx
│ │ │ ├── seeker/ # Seeker pages
│ │ │ │ ├── Jobs.jsx
│ │ │ │ ├── JobDetail.jsx
│ │ │ │ ├── Applications.jsx
│ │ │ │ ├── Profile.jsx
│ │ │ │ └── Notifications.jsx
│ │ │ ├── employer/ # Employer pages
│ │ │ │ ├── Jobs.jsx
│ │ │ │ ├── PostJob.jsx
│ │ │ │ ├── Applicants.jsx
│ │ │ │ ├── ApplicantDetail.jsx
│ │ │ │ ├── Profile.jsx
│ │ │ │ └── Notifications.jsx
│ │ │ └── admin/ # Admin pages
│ │ │ ├── Dashboard.jsx
│ │ │ ├── Users.jsx
│ │ │ ├── Jobs.jsx
│ │ │ └── Applications.jsx
│ │ ├── App.jsx # Main app component
│ │ ├── main.jsx # Entry point
│ │ └── index.css # Global styles
│ ├── index.html
│ ├── package.json
│ └── vite.config.js
│
├── server/ # Express Backend
│ ├── src/
│ │ ├── config/ # Configuration
│ │ │ └── db.js # Prisma client
│ │ ├── controllers/ # Business logic
│ │ │ ├── auth.controller.js
│ │ │ ├── seeker.controller.js
│ │ │ ├── employer.controller.js
│ │ │ ├── admin.controller.js
│ │ │ ├── feed.controller.js
│ │ │ ├── connection.controller.js
│ │ │ └── message.controller.js
│ │ ├── middleware/ # Express middleware
│ │ │ ├── auth.middleware.js
│ │ │ ├── role.middleware.js
│ │ │ ├── security.middleware.js
│ │ │ └── upload.middleware.js
│ │ ├── routes/ # API routes
│ │ │ ├── auth.routes.js
│ │ │ ├── seeker.routes.js
│ │ │ ├── employer.routes.js
│ │ │ ├── admin.routes.js
│ │ │ ├── feed.routes.js
│ │ │ ├── connection.routes.js
│ │ │ └── message.routes.js
│ │ └── server.js # Server entry point
│ ├── prisma/
│ │ └── schema.prisma # Database schema
│ ├── uploads/ # File uploads
│ │ ├── resumes/
│ │ ├── profiles/
│ │ ├── posts/
│ │ └── documents/
│ ├── package.json
│ └── .env
│
└── README.md
```


## 🚀 Installation

### Prerequisites

- Node.js (v20 or higher)
- PostgreSQL (v15 or higher)
- npm or yarn

### Step 1: Clone the Repository

```bash
git clone https://github.com/Rabin-Pant/TALENTBRIDGE
cd TalentBridge


Step 2: Install Backend Dependencies
cd server
npm install

Step 3: Install Frontend Dependencies
cd ../client
npm install

Step 4: Set Up Database
cd ../server
npx prisma migrate dev --name init
npx prisma generate

Step 5: Create Upload Directories
mkdir -p uploads/resumes uploads/profiles uploads/posts uploads/documents


🔧 Environment Variables
Backend (.env in /server)

# Server Configuration
PORT=5000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/talentbridge"

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Frontend URL
FRONTEND_URL=http://localhost:5173


Frontend (.env in /client)
VITE_API_URL=http://localhost:5000/api


🗄️ Database Schema
