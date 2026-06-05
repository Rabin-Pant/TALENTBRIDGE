# TalentBridge - Job Portal Platform

<div align="center">

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
│
├── client/ # React Frontend
│ ├── src/
│ │ ├── api/ # API configuration
│ │ ├── components/ # Reusable components
│ │ ├── context/ # React context
│ │ ├── pages/ # Page components
│ │ │ ├── auth/ # Authentication pages
│ │ │ ├── shared/ # Shared pages
│ │ │ ├── seeker/ # Seeker pages
│ │ │ ├── employer/ # Employer pages
│ │ │ └── admin/ # Admin pages
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
│ │ ├── controllers/ # Business logic
│ │ ├── middleware/ # Express middleware
│ │ ├── routes/ # API routes
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
├── .gitignore
└── README.md
```


## 🚀 Installation

### Prerequisites

- Node.js (v20 or higher)
- PostgreSQL (v15 or higher)
- npm or yarn

### Step 1: Clone the Repository

```
git clone https://github.com/Rabin-Pant/TALENTBRIDGE
cd TalentBridge
```

<<<<<<< HEAD

### Step 2: Install Backend Dependencies

```bash
=======
### Step 2: Install Backend Dependencies
```
>>>>>>> 3b61839353e9ebfe6d090272fd04f1370d5a75d5
cd server
npm install
```

<<<<<<< HEAD

Step 3: Install Frontend Dependencies

```bash
=======
### Step 3: Install Frontend Dependencies

```
>>>>>>> 3b61839353e9ebfe6d090272fd04f1370d5a75d5
cd ../client
npm install
```

### Step 4: Set Up Database

```
cd ../server
npx prisma migrate dev --name init
npx prisma generate
```

### Step 5: Create Upload Directories

```
mkdir -p uploads/resumes uploads/profiles uploads/posts uploads/documents
```

🔧 Environment Variables

Backend (.env in /server)
```
## Server Configuration

PORT=5000

## Database

DATABASE_URL="postgresql://username:password@localhost:5432/talentbridge"

## JWT

JWT_SECRET=your_super_secret_jwt_key_here

## Frontend URL

FRONTEND_URL=http://localhost:5173
```

🏃 Running the Application

Start Backend Server
```
cd server
npm run dev
```

Start Frontend Development Server
```
cd client
npm run dev
```

Build for Production
```
# Build frontend
cd client
npm run build

# Start backend with production config
cd ../server
npm start
```

🔒 Security Features

JWT-based authentication

Password hashing with bcrypt

Rate limiting on login attempts

Input sanitization

SQL injection protection (Prisma ORM)

XSS protection

CORS configuration

Role-based access control

Session management

<div align="center"> Made with ❤️ by Rabin Pant </div>
