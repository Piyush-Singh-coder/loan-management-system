# CreditSea - Backend

This is the Node.js/Express backend for the CreditSea Loan Management System.

## 🚀 Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables in `.env`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   CLIENT_URL=http://localhost:3000
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 🛠 Tech Stack
- **Node.js & Express**
- **TypeScript**
- **MongoDB & Mongoose**
- **Cloudinary** (Image/PDF processing)
- **JWT** (Security)

## 📂 Structure
- `/src/controllers`: Request/Response logic.
- `/src/models`: Database schemas.
- `/src/services`: Core business logic.
- `/src/routes`: API route definitions.
- `/src/middleware`: Auth, RBAC, and Error handling.
