# AWS Deployment & Setup Guide - Loan Management System (LMS)

This guide provides step-by-step instructions for deploying the **Loan Management System (LMS)** on AWS. The application uses:
- **AWS DynamoDB**: Managed NoSQL Database
- **AWS EC2 (Ubuntu 22.04 LTS)**: Single Server Hosting
- **Nginx**: Reverse Proxy (Routing `/api/` to Express backend and `/` to Next.js frontend)
- **PM2**: Node.js Process Manager for auto-restart and background execution

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step 1: DynamoDB Table Setup](#step-1-dynamodb-table-setup)
3. [Step 2: Create IAM Role for EC2](#step-2-create-iam-role-for-ec2)
4. [Step 3: Launch EC2 Instance](#step-3-launch-ec2-instance)
5. [Step 4: Configure Security Groups](#step-4-configure-security-groups)
6. [Step 5: Connect & Deploy Code on EC2](#step-5-connect--deploy-code-on-ec2)
7. [Step 6: Configure Environment Variables](#step-6-configure-environment-variables)
8. [Step 7: One-Click Build & Deployment](#step-7-one-click-build--deployment)
9. [Step 8: Nginx & Domain Setup](#step-8-nginx--domain-setup)
10. [Troubleshooting & Useful Commands](#troubleshooting--useful-commands)

---

## 1. Prerequisites
- An active **AWS Account**.
- Basic familiarity with SSH terminal commands.
- AWS CLI installed (optional, if creating tables locally).

---

## Step 1: DynamoDB Table Setup

LMS requires **3 DynamoDB Tables**:
1. `LMS_Users`
2. `LMS_Loans`
3. `LMS_Payments`

### Option A: Automated Table Creation Script (Recommended)
Run the automated table creation script included in the codebase:
```bash
cd backend
npm install
npm run create-tables
```

### Option B: AWS CLI Command (Manual Creation)

#### 1. Create `LMS_Users` Table:
```bash
aws dynamodb create-table \
    --table-name LMS_Users \
    --attribute-definitions AttributeName=id,AttributeType=S AttributeName=email,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --global-secondary-indexes '[
        {
            "IndexName": "EmailIndex",
            "KeySchema": [{"AttributeName": "email", "KeyType": "HASH"}],
            "Projection": {"ProjectionType": "ALL"}
        }
    ]' \
    --region us-east-1
```

#### 2. Create `LMS_Loans` Table:
```bash
aws dynamodb create-table \
    --table-name LMS_Loans \
    --attribute-definitions AttributeName=id,AttributeType=S AttributeName=borrowerId,AttributeType=S AttributeName=status,AttributeType=S AttributeName=createdAt,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --global-secondary-indexes '[
        {
            "IndexName": "BorrowerIndex",
            "KeySchema": [{"AttributeName": "borrowerId", "KeyType": "HASH"}],
            "Projection": {"ProjectionType": "ALL"}
        },
        {
            "IndexName": "StatusIndex",
            "KeySchema": [{"AttributeName": "status", "KeyType": "HASH"}, {"AttributeName": "createdAt", "KeyType": "RANGE"}],
            "Projection": {"ProjectionType": "ALL"}
        }
    ]' \
    --region us-east-1
```

#### 3. Create `LMS_Payments` Table:
```bash
aws dynamodb create-table \
    --table-name LMS_Payments \
    --attribute-definitions AttributeName=id,AttributeType=S AttributeName=loanId,AttributeType=S AttributeName=paymentDate,AttributeType=S AttributeName=utrNumber,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --global-secondary-indexes '[
        {
            "IndexName": "LoanIndex",
            "KeySchema": [{"AttributeName": "loanId", "KeyType": "HASH"}, {"AttributeName": "paymentDate", "KeyType": "RANGE"}],
            "Projection": {"ProjectionType": "ALL"}
        },
        {
            "IndexName": "UtrIndex",
            "KeySchema": [{"AttributeName": "utrNumber", "KeyType": "HASH"}],
            "Projection": {"ProjectionType": "ALL"}
        }
    ]' \
    --region us-east-1
```

---

## Step 2: Create IAM Role for EC2

To allow EC2 to securely access DynamoDB without hardcoding AWS secret keys:

1. Open **AWS Management Console** -> Search for **IAM**.
2. Click **Roles** -> **Create Role**.
3. Select **AWS Service** -> Choose **EC2** -> Click **Next**.
4. In Permissions policies, search and check **`AmazonDynamoDBFullAccess`**.
5. Name the role: `EC2-DynamoDB-LMS-Role`.
6. Click **Create Role**.

---

## Step 3: Launch EC2 Instance

1. Open **EC2 Console** -> Click **Launch Instance**.
2. **Name**: `LMS-Single-Server`
3. **AMI**: **Ubuntu Server 22.04 LTS (HVM), SSD Volume Type**.
4. **Architecture**: 64-bit (x86).
5. **Instance Type**: `t3.small` (2 vCPU, 2 GiB RAM recommended) or `t2.micro` (Free Tier).
6. **Key Pair**: Choose existing key pair or click **Create new key pair** (`lms-key.pem`). Save the `.pem` file safely.
7. **Storage**: Change 8 GB to **15 GB** GP3 SSD.

---

## Step 4: Configure Security Groups

In the Launch Instance wizard under **Network Settings** (or via EC2 Security Groups):

Add the following **Inbound Rules**:

| Type | Protocol | Port Range | Source | Purpose |
|---|---|---|---|---|
| SSH | TCP | 22 | My IP (or `0.0.0.0/0`) | Secure terminal access |
| HTTP | TCP | 80 | `0.0.0.0/0` | Public web access |
| HTTPS | TCP | 443 | `0.0.0.0/0` | SSL traffic |

After launch, attach the IAM Role created in Step 2:
- Select instance -> **Actions** -> **Security** -> **Modify IAM Role** -> Select `EC2-DynamoDB-LMS-Role` -> Click **Update IAM Role**.

---

## Step 5: Connect & Deploy Code on EC2

### 1. Connect via SSH
Open terminal on your local machine:
```bash
chmod 400 lms-key.pem
ssh -i "lms-key.pem" ubuntu@<YOUR-EC2-PUBLIC-IP>
```

### 2. Clone Repository on EC2
```bash
git clone https://github.com/Piyush-Singh-coder/loan-management-system.git
cd loan-management-system
```

---

## Step 6: Configure Environment Variables

### Backend Configuration:
Create `backend/.env`:
```bash
nano backend/.env
```
Paste:
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=super_secret_jwt_key_lms_2026
JWT_EXPIRES_IN=7d

# AWS DynamoDB Settings
AWS_REGION=us-east-1
USERS_TABLE=LMS_Users
LOANS_TABLE=LMS_Loans
PAYMENTS_TABLE=LMS_Payments

# Optional Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend Configuration:
Create `frontend/.env.local`:
```bash
nano frontend/.env.local
```
Paste (replace `<YOUR-EC2-PUBLIC-IP>` with your instance IP):
```env
NEXT_PUBLIC_API_URL=http://<YOUR-EC2-PUBLIC-IP>/api
```

---

## Step 7: One-Click Build & Deployment

Make `deploy.sh` executable and run it:
```bash
chmod +x deploy.sh
./deploy.sh
```

What `deploy.sh` automatically does:
1. Installs Node.js 20, Nginx, and PM2 on Ubuntu.
2. Builds the Express TypeScript backend (`npm run build`).
3. Executes DynamoDB table setup (`npm run create-tables`) and seed script (`npm run seed`).
4. Builds the Next.js production bundle (`npm run build`).
5. Configures Nginx reverse proxy.
6. Starts and enables PM2 for automatic process restart on system boot.

---

## Step 8: Nginx & Domain Setup

Nginx is pre-configured via `nginx.conf`:
- Requests to `http://<EC2-IP>/api/*` -> proxied to Express backend on `http://127.0.0.1:5000`
- Requests to `http://<EC2-IP>/*` -> proxied to Next.js frontend on `http://127.0.0.1:3000`

### Optional: Enable HTTPS with Certbot (Let's Encrypt)
If you point a domain (e.g., `lms.yourdomain.com`) to your EC2 Public IP:
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d lms.yourdomain.com
```

---

## Troubleshooting & Useful Commands

### Check Running Application Processes
```bash
pm2 status
```

### View Live Application Logs
```bash
# View backend logs
pm2 logs lms-backend

# View frontend logs
pm2 logs lms-frontend
```

### Restart Application
```bash
pm2 restart all
```

### Check Nginx Status & Logs
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Test API Health Endpoint
```bash
curl http://localhost:5000/api/health
```

---

## Default Seed Accounts Created

Upon first seed run, the following accounts are initialized:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@lms.com` | `Admin@123` |
| Sales | `sales@lms.com` | `Sales@123` |
| Sanction | `sanction@lms.com` | `Sanction@123` |
| Disbursement | `disburse@lms.com` | `Disburse@123` |
| Collection | `collection@lms.com` | `Collect@123` |
