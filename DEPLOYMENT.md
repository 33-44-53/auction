# Deployment Guide

This guide will help you deploy the Tender Management System with:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Neon (PostgreSQL)

## Prerequisites

- GitHub account
- Vercel account (free tier)
- Render account (free tier)
- Neon account (free tier)

---

## Step 1: Setup Neon Database (PostgreSQL)

1. **Create Neon Account**
   - Go to https://neon.tech
   - Sign up for a free account

2. **Create a New Project**
   - Click "Create Project"
   - Name: `tender-management-db`
   - Region: Choose closest to your users
   - PostgreSQL version: 15 or latest

3. **Get Connection String**
   - After project creation, copy the connection string
   - It looks like: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`
   - Save this for later!

---

## Step 2: Push Code to GitHub

1. **Initialize Git Repository** (if not already done)
   ```bash
   cd auction
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**
   - Go to https://github.com/new
   - Name: `tender-management-system`
   - Make it private (recommended)
   - Don't initialize with README

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/tender-management-system.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 3: Deploy Backend to Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `tender-management-system`

3. **Configure Service**
   - **Name**: `tender-management-backend`
   - **Region**: Oregon (US West) or closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave empty (root of repo)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable":
   
   ```
   NODE_ENV=production
   DATABASE_URL=<YOUR_NEON_CONNECTION_STRING>
   JWT_SECRET=<GENERATE_RANDOM_STRING>
   JWT_EXPIRES_IN=24h
   PORT=3000
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=50MB
   ```

   **To generate JWT_SECRET**, run in terminal:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Copy your backend URL: `https://tender-management-backend.onrender.com`

6. **Run Database Migration**
   - After first deployment, go to "Shell" tab in Render
   - Run: `npx prisma migrate deploy`
   - Run seed: `npm run seed`

---

## Step 4: Deploy Frontend to Vercel

1. **Update vercel.json**
   - Open `frontend/vercel.json`
   - Replace `https://your-backend.onrender.com` with your actual Render URL

2. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

3. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select `tender-management-system`

4. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variables**
   ```
   VITE_API_URL=https://tender-management-backend.onrender.com
   ```

6. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at: `https://your-app.vercel.app`

---

## Step 5: Update CORS Settings

1. **Update Backend CORS**
   - Go to your Render dashboard
   - Navigate to Environment Variables
   - Add:
     ```
     FRONTEND_URL=https://your-app.vercel.app
     ```
   - Redeploy the service

2. **Update server.js** (already done in code)
   - The CORS configuration now accepts your Vercel URL

---

## Step 6: Test Deployment

1. **Visit Your App**
   - Go to `https://your-app.vercel.app`
   - You should see the landing page

2. **Test Login**
   - Click "Login"
   - Use default credentials:
     - Email: `admin@tender.com`
     - Password: `admin123`

3. **Test Features**
   - Create a tender
   - Upload Excel file
   - Add bids
   - Export documents

---

## Troubleshooting

### Backend Issues

**Problem**: Database connection error
- **Solution**: Check DATABASE_URL in Render environment variables
- Make sure it includes `?sslmode=require` at the end

**Problem**: Prisma migration fails
- **Solution**: Run manually in Render Shell:
  ```bash
  npx prisma migrate deploy
  npx prisma generate
  npm run seed
  ```

**Problem**: 502 Bad Gateway
- **Solution**: Check Render logs for errors
- Ensure all environment variables are set

### Frontend Issues

**Problem**: API calls fail (CORS error)
- **Solution**: 
  1. Check VITE_API_URL in Vercel
  2. Check FRONTEND_URL in Render
  3. Redeploy both services

**Problem**: Blank page after deployment
- **Solution**: Check browser console for errors
- Verify build completed successfully in Vercel

### Database Issues

**Problem**: Connection timeout
- **Solution**: Neon free tier may sleep after inactivity
- First request might be slow (cold start)

---

## Environment Variables Summary

### Backend (Render)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
JWT_SECRET=your-random-secret-key-here
JWT_EXPIRES_IN=24h
PORT=3000
FRONTEND_URL=https://your-app.vercel.app
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50MB
```

### Frontend (Vercel)
```env
VITE_API_URL=https://tender-management-backend.onrender.com
```

---

## Post-Deployment

### Custom Domain (Optional)

**Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

**Render:**
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records

### Monitoring

**Render:**
- Check logs: Dashboard → Logs
- Monitor metrics: Dashboard → Metrics

**Vercel:**
- Check deployments: Project → Deployments
- View analytics: Project → Analytics

**Neon:**
- Monitor database: Dashboard → Monitoring
- Check queries: Dashboard → Query Stats

---

## Maintenance

### Update Application

1. **Make changes locally**
2. **Commit and push to GitHub**
   ```bash
   git add .
   git commit -m "Update feature"
   git push
   ```
3. **Auto-deploy**
   - Vercel and Render will automatically deploy on push

### Database Migrations

1. **Create migration locally**
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add migration"
   git push
   ```

3. **Deploy on Render**
   - Render will run `npm run build` which includes `prisma migrate deploy`

### Backup Database

**Neon:**
- Go to Dashboard → Backups
- Neon automatically creates daily backups
- Restore from backup if needed

---

## Cost Breakdown

### Free Tier Limits

**Neon (Database):**
- ✅ 3 GB storage
- ✅ 1 project
- ✅ Unlimited queries
- ✅ Auto-suspend after inactivity

**Render (Backend):**
- ✅ 750 hours/month
- ✅ 512 MB RAM
- ✅ Auto-sleep after 15 min inactivity
- ⚠️ Cold starts (slow first request)

**Vercel (Frontend):**
- ✅ Unlimited bandwidth
- ✅ 100 GB bandwidth/month
- ✅ Automatic SSL
- ✅ Global CDN

### Upgrade Recommendations

For production use with real traffic:
- **Render**: $7/month (no sleep, better performance)
- **Neon**: $19/month (more storage, no auto-suspend)
- **Vercel**: Free tier is usually sufficient

---

## Security Checklist

- ✅ Change default admin password after first login
- ✅ Use strong JWT_SECRET (32+ characters)
- ✅ Enable HTTPS (automatic on Vercel/Render)
- ✅ Set up database backups
- ✅ Monitor error logs regularly
- ✅ Keep dependencies updated
- ✅ Use environment variables for secrets
- ✅ Enable Neon IP allowlist (optional)

---

## Support

If you encounter issues:

1. **Check Logs**
   - Render: Dashboard → Logs
   - Vercel: Project → Deployments → View Function Logs
   - Neon: Dashboard → Monitoring

2. **Common Issues**
   - Cold starts: First request after inactivity is slow
   - CORS errors: Check environment variables
   - Database timeout: Neon free tier auto-suspends

3. **Resources**
   - Render Docs: https://render.com/docs
   - Vercel Docs: https://vercel.com/docs
   - Neon Docs: https://neon.tech/docs

---

## Success! 🎉

Your Tender Management System is now live:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://tender-management-backend.onrender.com
- **Database**: Neon PostgreSQL

Default login:
- Email: `admin@tender.com`
- Password: `admin123`

**Remember to change the default password!**
