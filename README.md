# CreditSea - Full-Stack Loan Management System (LMS)

A robust, enterprise-grade Loan Management System built with a modern tech stack. CreditSea streamlines the entire loan lifecycle—from borrower registration and automated eligibility checks (BRE) to sanctioning, disbursement, and collection tracking.

🚀 **Live Demo:** [https://credit-sea-ten.vercel.app/](https://credit-sea-ten.vercel.app/)

---

## 🛠 Tech Stack

### Frontend
- **Framework:** [Next.js 14+](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **API Client:** Axios
- **Animations:** Framer Motion / Tailwind Animate
- **Notifications:** React Toastify

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (using [Mongoose](https://mongoosejs.com/))
- **File Storage:** [Cloudinary](https://cloudinary.com/) (for Salary Slip uploads)
- **Authentication:** JSON Web Tokens (JWT) & BcryptJS
- **Validation:** Custom Middleware & Type Safety

---

## ✨ Key Features

- **Multi-Role RBAC:** Dedicated dashboards for **Borrowers**, **Sales**, **Sanction**, **Disbursement**, and **Collection** officers.
- **Automated BRE (Business Rules Engine):** Instant eligibility feedback based on salary and employment type.
- **Seamless Application Flow:** Step-by-step loan application process with document upload integration.
- **Real-time Tracking:** Dynamic dashboard for borrowers to track application status and outstanding balances.
- **Glassmorphism UI:** Premium, modern fintech aesthetic with smooth micro-animations.
- **Secure Authentication:** Robust JWT-based auth flow with persisted sessions and protected routes.

---

## 📁 Project Structure

```bash
├── backend/            # Express.js Server
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # Mongoose schemas
│   │   ├── services/    # Business logic
│   │   ├── routes/      # API endpoints
│   │   └── middleware/  # Auth & Error handling
│   └── vercel.json     # Backend deployment config
├── frontend/           # Next.js Application
│   ├── src/
│   │   ├── app/         # Pages & Layouts (App Router)
│   │   ├── components/  # Reusable UI components
│   │   ├── store/       # Zustand state stores
│   │   └── services/    # API integration
└── README.md           # Documentation
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   CLIENT_URL=http://localhost:3000
   ```
4. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. `npm run dev`

---

## 🛡 Security & Best Practices

- **CORS Configuration:** Backend strictly allows only authorized `CLIENT_URL`.
- **Error Handling:** Centralized global error handling middleware in the backend.
- **Protected Routes:** Frontend route guards using Zustand hydration checks to prevent flicker and unauthorized access.
- **Type Safety:** Shared interfaces across the frontend and backend to ensure data consistency.

---

## 📄 License
This project is developed for demonstration purposes. All rights reserved.

---
Built with ❤️ for CreditSea.
