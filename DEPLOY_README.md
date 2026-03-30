# Tender Management System - Deployment Ready

Complete tender management system with frontend on Vercel, backend on Render, and database on Neon PostgreSQL.

## 🚀 Quick Deploy

### Prerequisites
- Node.js 18+
- GitHub account
- Vercel account (free)
- Render account (free)
- Neon account (free)

### Local Development

1. **Clone and setup backend:**
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev
   npm run seed
   npm run dev
   ```

2. **Setup frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000
   - Login: admin@tender.com / admin123

## 🌐 Production Deployment

Follow the complete guide in [DEPLOYMENT.md](./DEPLOYMENT.md)

### Quick Steps:

1. **Database (Neon):**
   - Create account at https://neon.tech
   - Create new project
   - Copy connection string

2. **Backend (Render):**
   - Push code to GitHub
   - Create Web Service on Render
   - Add environment variables
   - Deploy

3. **Frontend (Vercel):**
   - Import GitHub repo
   - Set root directory to `frontend`
   - Add VITE_API_URL environment variable
   - Deploy

## 📁 Project Structure

```
auction/
├── prisma/              # Database schema & migrations
├── src/
│   ├── middleware/      # Auth, audit, error handling
│   ├── routes/          # API endpoints
│   └── server.js        # Express server
├── frontend/
│   └── src/
│       └── App.jsx      # React application
├── DEPLOYMENT.md        # Complete deployment guide
└── render.yaml          # Render configuration
```

## 🔑 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=3000
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend.onrender.com
```

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [README](./README.md) - Project overview and features

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, Prisma, PostgreSQL
- **Frontend:** React, Vite, Tailwind CSS
- **Deployment:** Vercel (Frontend), Render (Backend), Neon (Database)

## 📝 License

MIT
