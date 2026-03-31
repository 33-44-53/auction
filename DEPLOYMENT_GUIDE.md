# Deployment Guide - Fix CORS Error

## Problem
Your frontend (Vercel) cannot connect to your backend (Render) due to CORS policy.

## Solution: Configure Environment Variables

### Part 1: Backend (Render) Configuration

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com/
   - Click on your backend service: `auction-i5wc`

2. **Add Environment Variables**
   - Click "Environment" tab (left sidebar)
   - Click "Add Environment Variable" button
   - Add these variables:

   ```
   Key: FRONTEND_URL
   Value: https://auction-diredawa.vercel.app
   ```

   ```
   Key: NODE_ENV
   Value: production
   ```

3. **Save and Wait for Redeploy**
   - Click "Save Changes"
   - Render will automatically redeploy (2-5 minutes)
   - Wait for status to show "Live" ✅

---

### Part 2: Frontend (Vercel) Configuration

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project: `auction-diredawa`

2. **Add Environment Variable**
   - Click "Settings" tab
   - Click "Environment Variables" in left sidebar
   - Click "Add New" button
   - Add this variable:

   ```
   Key: VITE_API_URL
   Value: https://auction-i5wc.onrender.com/api
   ```

   - Select all environments: Production, Preview, Development
   - Click "Save"

3. **Redeploy Frontend**
   - Go to "Deployments" tab
   - Click the three dots (...) on the latest deployment
   - Click "Redeploy"
   - Wait for deployment to complete (1-2 minutes)

---

## Verification Steps

After both deployments complete:

1. **Open your frontend**: https://auction-diredawa.vercel.app
2. **Try to login** with: `admin@tender.com` / `admin123`
3. **Check browser console** (F12) - CORS error should be gone!

---

## Troubleshooting

### If CORS error persists:

1. **Check Render Logs**
   - Go to Render dashboard → Your service → Logs tab
   - Look for: "CORS Allowed Origins:"
   - Should show: `https://auction-diredawa.vercel.app`

2. **Check Vercel Environment Variables**
   - Go to Vercel → Settings → Environment Variables
   - Verify `VITE_API_URL` is set correctly
   - Make sure it ends with `/api`

3. **Clear Browser Cache**
   - Press Ctrl+Shift+Delete
   - Clear cached images and files
   - Try again

4. **Check Network Tab**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try to login
   - Click on the failed request
   - Check "Response Headers" - should see `Access-Control-Allow-Origin`

---

## Quick Reference

| Platform | Variable | Value |
|----------|----------|-------|
| **Render** (Backend) | `FRONTEND_URL` | `https://auction-diredawa.vercel.app` |
| **Render** (Backend) | `NODE_ENV` | `production` |
| **Vercel** (Frontend) | `VITE_API_URL` | `https://auction-i5wc.onrender.com/api` |

---

## Important Notes

✅ Both services must be redeployed after adding environment variables  
✅ Wait for deployments to complete before testing  
✅ Environment variables are case-sensitive  
✅ No trailing slashes in URLs (except `/api` for frontend)  
✅ CORS error will disappear once both are configured correctly

---

## Success Indicators

When everything is working:
- ✅ No CORS errors in browser console
- ✅ Login works successfully
- ✅ Dashboard loads with data
- ✅ API requests complete successfully

---

## Need Help?

If you still see CORS errors after following these steps:
1. Check Render logs for CORS messages
2. Verify environment variables are saved
3. Confirm both services redeployed successfully
4. Try in incognito/private browsing mode
