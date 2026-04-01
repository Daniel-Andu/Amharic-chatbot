# Deployment Guide - AI Assistant System

## 🚀 Quick Deploy Options

### Option 1: Render (Recommended - Free Tier Available)

#### Backend Deployment
1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub repository
3. Create **New Web Service**
4. Settings:
   - **Name**: amharic-chatbot-backend
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: npm install
   - **Start Command**: npm start
   - **Health Check Path**: /health

#### Required Environment Variables for Render Backend:
```
NODE_ENV=production
PORT=5000
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
HUGGINGFACE_API_KEY=your_huggingface_api_key
GROQ_API_KEY=your_groq_api_key
```

#### Frontend Deployments
1. **Customer Chat**:
   - **Name**: amharic-chatbot-customer
   - **Root Directory**: customer-chat
   - **Runtime**: Static
   - **Build Command**: npm run build
   - **Publish Directory**: build
   - **Environment Variable**: REACT_APP_API_URL=https://your-backend-url.onrender.com/api

2. **Admin Dashboard**:
   - **Name**: amharic-chatbot-admin
   - **Root Directory**: admin-frontend
   - **Runtime**: Static
   - **Build Command**: npm run build
   - **Publish Directory**: build
   - **Environment Variable**: REACT_APP_API_URL=https://your-backend-url.onrender.com/api

### Option 2: Vercel (Frontend Only)

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`
3. Set environment variables in Vercel dashboard

### Option 3: Traditional VPS/Server Deployment

#### Requirements
- Ubuntu 20.04+ or similar Linux distribution
- 2GB+ RAM
- Node.js 18+
- PostgreSQL 14+
- Nginx (for reverse proxy)
- SSL certificate (Let's Encrypt recommended)

#### Steps

1. **Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

2. **Database Setup**
```bash
sudo -u postgres psql
CREATE DATABASE ai_assistant_db;
CREATE USER ai_assistant WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ai_assistant_db TO ai_assistant;
\q
```

3. **Deploy Backend**
```bash
# Clone or upload your code
cd /var/www
git clone your-repo-url ai-assistant
cd ai-assistant/backend

# Install dependencies
npm install --production

# Setup environment
cp .env.example .env
nano .env  # Edit with production values

# Run migrations
npm run migrate

# Start with PM2
pm2 start src/server.js --name ai-assistant-backend
pm2 save
pm2 startup
```

4. **Deploy Frontend**
```bash
cd /var/www/ai-assistant/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Move build to web root
sudo cp -r build /var/www/ai-assistant-frontend
```

5. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/ai-assistant
```

Add configuration:
```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Frontend
server {
    listen 80;
    server_name admin.yourdomain.com;
    root /var/www/ai-assistant-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Chat Widget
server {
    listen 80;
    server_name chat.yourdomain.com;
    root /var/www/ai-assistant-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/ai-assistant /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **Setup SSL with Let's Encrypt**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com -d admin.yourdomain.com -d chat.yourdomain.com
```

### Option 2: Docker Deployment

1. **Create Dockerfile for Backend**
```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]
```

2. **Create Dockerfile for Frontend**
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

3. **Create docker-compose.yml**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: ai_assistant_db
      POSTGRES_USER: ai_assistant
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=ai_assistant_db
      - DB_USER=ai_assistant
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - GROQ_API_KEY=${GROQ_API_KEY}
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

4. **Deploy with Docker**
```bash
# Create .env file with secrets
echo "DB_PASSWORD=your_secure_password" > .env
echo "JWT_SECRET=your_jwt_secret" >> .env
echo "GROQ_API_KEY=your_groq_api_key" >> .env

# Build and start
docker-compose up -d

# Run migrations
docker-compose exec backend npm run migrate
```

### Option 3: Cloud Platform Deployment

#### Heroku
```bash
# Install Heroku CLI
# Login
heroku login

# Create apps
heroku create ai-assistant-backend
heroku create ai-assistant-frontend

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev -a ai-assistant-backend

# Deploy backend
cd backend
git init
heroku git:remote -a ai-assistant-backend
git add .
git commit -m "Deploy backend"
git push heroku master

# Deploy frontend
cd ../frontend
# Update API URL in .env to point to Heroku backend
npm run build
# Deploy build folder
```

#### AWS (EC2 + RDS)
1. Launch EC2 instance (t2.medium recommended)
2. Create RDS PostgreSQL instance
3. Follow VPS deployment steps above
4. Configure security groups for ports 80, 443, 5432

#### DigitalOcean App Platform
1. Connect your GitHub repository
2. Configure build settings:
   - Backend: Node.js, build command: `npm install`, run command: `npm start`
   - Frontend: Static site, build command: `npm run build`, output: `build`
3. Add environment variables
4. Deploy

## Post-Deployment Checklist

- [ ] Change default admin password
- [ ] Configure CORS for production domains
- [ ] Set up database backups
- [ ] Configure monitoring (PM2, New Relic, etc.)
- [ ] Set up logging (CloudWatch, Papertrail, etc.)
- [ ] Enable rate limiting
- [ ] Configure CDN for frontend (CloudFlare, etc.)
- [ ] Set up SSL certificates
- [ ] Test all features in production
- [ ] Configure email notifications
- [ ] Set up automated backups
- [ ] Document API endpoints
- [ ] Create admin user guide

## Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs ai-assistant-backend
```

### Database Backups
```bash
# Create backup script
sudo nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -U ai_assistant ai_assistant_db > $BACKUP_DIR/backup_$TIMESTAMP.sql
find $BACKUP_DIR -type f -mtime +7 -delete
```

```bash
chmod +x /usr/local/bin/backup-db.sh
# Add to crontab
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-db.sh
```

## Scaling Considerations

- Use load balancer for multiple backend instances
- Implement Redis for session management
- Use CDN for static assets
- Consider managed database services (AWS RDS, etc.)
- Implement caching strategies
- Use message queues for async tasks

## Security Best Practices

- Keep dependencies updated
- Use environment variables for secrets
- Implement rate limiting
- Enable HTTPS only
- Regular security audits
- Database encryption at rest
- Implement proper CORS policies
- Use security headers (helmet.js)
- Regular backups
- Monitor for suspicious activity
