# Push to GitHub - Step by Step

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `tender-management-system`
3. Description: `Secure Tender Management System for Dire Dawa Customs Commission`
4. Choose: **Private** (recommended) or Public
5. **DO NOT** check "Initialize with README"
6. Click "Create repository"

## Step 2: Initialize Git and Push

Open Command Prompt or PowerShell in the project directory and run:

```bash
# Navigate to project directory
cd c:\Users\Oumer\Desktop\auction

# Initialize Git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Tender Management System with deployment configs"

# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/tender-management-system.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Verify Upload

1. Go to your GitHub repository
2. Refresh the page
3. You should see all files uploaded

## Alternative: Using GitHub Desktop

If you prefer a GUI:

1. Download GitHub Desktop: https://desktop.github.com/
2. Install and sign in
3. Click "Add" → "Add Existing Repository"
4. Choose: `c:\Users\Oumer\Desktop\auction`
5. Click "Publish repository"
6. Choose name and visibility
7. Click "Publish"

## Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/tender-management-system.git
```

### Error: "failed to push some refs"
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Authentication Issues
If prompted for credentials:
- Username: Your GitHub username
- Password: Use Personal Access Token (not your password)
  - Generate token: https://github.com/settings/tokens
  - Select scopes: `repo` (full control)

## What Gets Pushed

✅ Source code (backend & frontend)
✅ Configuration files
✅ Documentation
✅ Database migrations
✅ Package files

❌ node_modules (ignored)
❌ .env files (ignored)
❌ Database files (ignored)
❌ Uploads (ignored)

## Next Steps After Push

1. Deploy backend to Render
2. Deploy frontend to Vercel
3. Setup Neon database

See DEPLOYMENT.md for complete deployment guide.
