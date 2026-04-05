# Database Management - Quick Reference

## Current Status
✅ **Database is healthy and has plenty of space**
- Current size: 0.14 MB (actual data)
- Neon reports: 0.5 GB (includes infrastructure)
- You have room to grow!

## When Will It Get Full?

| Usage Level | Timeline | Action Needed |
|------------|----------|---------------|
| **Normal** | 2-3 years | Monitor monthly |
| **Heavy** | 6-12 months | Implement cleanup |
| **Very Heavy** | 3-6 months | Cleanup + consider upgrade |

## Quick Commands

### Check Database Size
```bash
node cleanup-database.js stats
```

### Preview Cleanup (Safe - No Changes)
```bash
node cleanup-database.js full --dry-run
```

### Run Full Cleanup
```bash
node cleanup-database.js full
```

### Clean Only Audit Logs (Keep 60 days)
```bash
node cleanup-database.js audit-logs 60
```

### Archive Old Tenders (Older than 6 months)
```bash
node cleanup-database.js archive 6
```

## Recommended Schedule

### Monthly (Recommended)
```bash
# Check database size
node cleanup-database.js stats
```

### Quarterly (Every 3 months)
```bash
# Clean audit logs older than 90 days
node cleanup-database.js audit-logs 90
```

### Yearly
```bash
# Archive tenders older than 12 months
node cleanup-database.js archive 12

# Delete archived data older than 2 years
node cleanup-database.js delete-old 2
```

## What Gets Cleaned?

### Audit Logs (Safe to Delete)
- Login events
- Export actions
- View actions
- **Keeps**: Winner selections, group closures, important actions

### Archived Tenders (Safe to Delete After 2 Years)
- Old completed tenders
- All related groups, items, bids
- **Keeps**: Recent tenders (last 12 months)

## Warning Signs

### ⚠️ Warning (15 MB)
- Time to run cleanup
- Consider implementing scheduled cleanup

### 🚨 Critical (20 MB)
- Immediate cleanup needed
- Consider upgrading to Neon Pro ($19/month)

## Upgrade Options

### When to Upgrade?
- When cleanup isn't enough
- When you reach 15-20 MB of data
- When you have 50+ active tenders
- When you need better performance

### Neon Pro Plan
- **Cost**: $19/month
- **Storage**: 10 GB (20x more)
- **Benefits**: Better performance, no auto-suspend

### Alternative: Self-Hosted
- **AWS RDS**: $15-30/month, 20+ GB
- **DigitalOcean**: $15/month, 10 GB
- **VPS**: $5-10/month, 25-50 GB

## Automation (Optional)

### Set Up Cron Job (Linux/Mac)
```bash
# Edit crontab
crontab -e

# Add this line to run cleanup monthly
0 0 1 * * cd /path/to/auction && node cleanup-database.js full
```

### Set Up Task Scheduler (Windows)
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Monthly
4. Action: Start a program
5. Program: `node`
6. Arguments: `cleanup-database.js full`
7. Start in: `C:\Users\Oumer\Desktop\auction`

## Need Help?

### View All Commands
```bash
node cleanup-database.js help
```

### Analyze Database
```bash
node analyze-database.js
```

### Check Documentation
- `DATABASE_STORAGE_ANALYSIS.md` - Current storage breakdown
- `DATABASE_CAPACITY_FUTURE.md` - Future capacity planning

## Summary

✅ **You're safe for now** - Only 0.14 MB used
✅ **Run cleanup quarterly** - Keeps database healthy
✅ **Monitor monthly** - Check size with `stats` command
✅ **Upgrade when needed** - Around 15-20 MB of data

**Bottom Line**: Your database won't get full for 2-3 years with normal usage. Just run cleanup quarterly and you'll be fine!
