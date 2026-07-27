#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting LMS Single-Server Deployment on EC2..."

# 1. Update system packages & install Nginx & Node.js 20 if not present
echo "📦 Updating system dependencies & Node.js..."
sudo apt-get update -y
sudo apt-get install -y curl git nginx

if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# 2. Build Backend
echo "🔨 Building Backend..."
cd backend
npm install
npm run build
npm run create-tables || echo "Tables creation command finished."
npm run seed || echo "Seeding finished."
cd ..

# 3. Build Frontend
echo "🔨 Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# 4. Configure Nginx
echo "🌐 Configuring Nginx Reverse Proxy..."
sudo cp nginx.conf /etc/nginx/sites-available/lms
sudo ln -sf /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 5. Start/Restart PM2 Processes
echo "🔄 Starting PM2 processes..."
pm2 startOrReload ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER || true

echo "✨ LMS Deployment Complete! Access your app at http://<EC2-PUBLIC-IP>"
