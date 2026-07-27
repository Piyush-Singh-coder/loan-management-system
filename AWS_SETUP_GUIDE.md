# Complete Step-by-Step AWS Setup & Deployment Guide for Loan Management System (LMS)

This guide provides end-to-end instructions for deploying the **Loan Management System** on AWS using **DynamoDB** as the database, **AWS EC2 (Ubuntu 22.04 LTS)** as the single application server, **Nginx** as the reverse proxy, and **PM2** as the process manager.

---

## 🛠 Step 1: Set Up AWS DynamoDB

You have two choices for DynamoDB:
1. **AWS Cloud DynamoDB** (Recommended for production/AWS deployment).
2. **DynamoDB Local** (For testing locally on port 8000).

### Creating DynamoDB Tables via AWS Console or CLI:
The application includes an automated table creation script. If deploying to AWS Cloud:

#### Option A: Automated Script (Recommended)
1. Ensure your AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`) are set in your `.env` file in the `backend/` directory.
2. Run:
   ```bash
   cd backend
   npm run create-tables
   ```
   This creates three tables automatically:
   - **`LMS_Users`**: Primary key `id` (String), GSI `EmailIndex` (`email`).
   - **`LMS_Loans`**: Primary key `id` (String), GSI `BorrowerIndex` (`borrowerId`), GSI `StatusIndex` (`status`, `createdAt`).
   - **`LMS_Payments`**: Primary key `id` (String), GSI `LoanIndex` (`loanId`, `paymentDate`), GSI `UtrIndex` (`utrNumber`).

---

## 💻 Step 2: Create & Configure AWS EC2 Instance

### 1. Launch Instance
1. Log into AWS Console -> Go to **EC2** -> Click **Launch Instance**.
2. **Name**: `LMS-Single-Server`
3. **AMI**: Ubuntu Server 22.04 LTS (64-bit x86).
4. **Instance Type**: `t2.micro` (Free tier eligible) or `t3.small` (Recommended for Next.js build).
5. **Key Pair**: Select existing key pair or click "Create new key pair" (`lms-key.pem`).
6. **Network Settings (Security Group)**:
   - Allow **SSH** (Port 22) from your IP (`0.0.0.0/0` or your IP).
   - Allow **HTTP** (Port 80) from Anywhere (`0.0.0.0/0`).
   - Allow **HTTPS** (Port 443) from Anywhere (`0.0.0.0/0`).
7. **Storage**: 15 GB General Purpose SSD (gp3).
8. Click **Launch Instance**.

---

## 🔐 Step 3: Attach IAM Role for DynamoDB Access

To let EC2 communicate with DynamoDB securely without hardcoding secret keys:

1. Open AWS Console -> Go to **IAM** -> **Roles** -> Click **Create Role**.
2. **Trusted Entity Type**: AWS Service -> Select **EC2**.
3. **Permissions Policies**: Search for `AmazonDynamoDBFullAccess` (or create custom policy for LMS tables) and select it.
4. **Role Name**: `EC2-DynamoDB-LMS-Role` -> Click **Create Role**.
5. Go back to **EC2 Console** -> Select your instance `LMS-Single-Server`.
6. Click **Actions** -> **Security** -> **Modify IAM Role**.
7. Choose `EC2-DynamoDB-LMS-Role` and click **Update IAM Role**.

---

## 🚀 Step 4: Deploying on EC2 Instance

### 1. SSH into your EC2 Instance
```bash
chmod 400 lms-key.pem
ssh -i "lms-key.pem" ubuntu@<YOUR-EC2-PUBLIC-IP>
```

### 2. Clone Repository onto EC2
```bash
git clone https://github.com/Piyush-Singh-coder/loan-management-system.git
cd loan-management-system
```

### 3. Setup Environment Variables

Create `backend/.env` file:
```bash
nano backend/.env
```
Paste the following:
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_here_12345
JWT_EXPIRES_IN=7d

# AWS DynamoDB Configuration
AWS_REGION=us-east-1
USERS_TABLE=LMS_Users
LOANS_TABLE=LMS_Loans
PAYMENTS_TABLE=LMS_Payments

# Optional Cloudinary (for salary slip uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create `frontend/.env.local` file:
```bash
nano frontend/.env.local
```
Paste:
```env
NEXT_PUBLIC_API_URL=http://<YOUR-EC2-PUBLIC-IP>/api
```

### 4. Run One-Click Deployment Script
Make script executable and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🌐 Step 5: Verification & Access

1. Open your browser and visit: `http://<YOUR-EC2-PUBLIC-IP>`
2. Test Backend Health Check: `http://<YOUR-EC2-PUBLIC-IP>/api/health`
3. Default Seed Credentials (created automatically):
   - **Admin**: `admin@lms.com` / `Admin@123`
   - **Sales**: `sales@lms.com` / `Sales@123`
   - **Sanction**: `sanction@lms.com` / `Sanction@123`
   - **Disbursement**: `disburse@lms.com` / `Disburse@123`
   - **Collection**: `collection@lms.com` / `Collect@123`

---

## 🔄 Useful Maintenance Commands

- **Check PM2 process status**: `pm2 status`
- **View backend logs**: `pm2 logs lms-backend`
- **View frontend logs**: `pm2 logs lms-frontend`
- **Restart processes**: `pm2 restart all`
- **Test Nginx config**: `sudo nginx -t`
- **Restart Nginx**: `sudo systemctl restart nginx`
