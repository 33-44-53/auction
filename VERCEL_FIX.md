# 🚨 URGENT FIX: Blank /tenders Page

## The Problem:
The `/tenders` page is blank because **Vercel doesn't know where your backend API is!**

The frontend is trying to call the API but `VITE_API_URL` is not set in Vercel.

---

## ✅ SOLUTION: Add Environment Variable to Vercel

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Click on your project: **auction-diredawa**

### Step 2: Add Environment Variable
1. Click **"Settings"** tab (top menu)
2. Click **"Environment Variables"** (left sidebar)
3. Click **"Add New"** button

### Step 3: Enter the Variable
```
Name:  VITE_API_URL
Value: https://auction-i5wc.onrender.com
```

**IMPORTANT:** 
- ✅ Use: `https://auction-i5wc.onrender.com` (NO `/api` at the end)
- ❌ Don't use: `https://auction-i5wc.onrender.com/api`

### Step 4: Select Environments
- ✅ Check: **Production**
- ✅ Check: **Preview**
- ✅ Check: **Development**

### Step 5: Save
- Click **"Save"** button

### Step 6: Redeploy
1. Go to **"Deployments"** tab
2. Click the **three dots (...)** on the latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes

---

## 🎯 After Redeployment:

**Test these:**
1. Go to: https://auction-diredawa.vercel.app/login
2. Login with: `admin@tender.com` / `admin123`
3. Go to: https://auction-diredawa.vercel.app/tenders
4. **Should work now!** ✅

---

## 📸 Visual Guide:

```
Vercel Dashboard
  └─ auction-diredawa (your project)
      └─ Settings
          └─ Environment Variables
              └─ Add New
                  Name:  VITE_API_URL
                  Value: https://auction-i5wc.onrender.com
                  [✓] Production
                  [✓] Preview  
                  [✓] Development
                  [Save]
```

---

## ⚠️ Why This Happened:

The frontend code uses:
```javascript
baseURL: import.meta.env.VITE_API_URL || '/api'
```

Without `VITE_API_URL` set, it defaults to `/api` which tries to call:
- `https://auction-diredawa.vercel.app/api` ❌ (doesn't exist)

Instead of:
- `https://auction-i5wc.onrender.com/api` ✅ (your backend)

---

## 🔍 How to Verify It's Set:

After adding the variable, you should see:
```
VITE_API_URL
https://auction-i5wc.onrender.com
Production, Preview, Development
```

---

**This is a 2-minute fix! Just add the environment variable and redeploy.** 🚀
