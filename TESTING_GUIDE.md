# Quick Start Guide - Testing RBAC Implementation

## Setup

1. **Start Backend**
```bash
cd c:\Users\Oumer\Desktop\auction
npm run dev
```

2. **Start Frontend** (in new terminal)
```bash
cd c:\Users\Oumer\Desktop\auction\frontend
npm run dev
```

3. **Access Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Test Scenario 1: Admin User

### Login as Admin
- Email: `admin@tender.com`
- Password: `admin123`

### Expected Behavior
1. **Sidebar shows ALL tabs:**
   - Dashboard
   - Tenders
   - Bidders
   - Audit Logs
   - Users

2. **Dashboard shows:**
   - All system statistics
   - All tenders (if any exist)

3. **Can access:**
   - All tenders (view, edit, delete)
   - All bidders (view, edit, delete)
   - Audit logs
   - User management

## Test Scenario 2: Staff User (First Login)

### Login as Staff
- Email: `staff@tender.com`
- Password: `staff123`

### Expected Behavior
1. **Sidebar shows LIMITED tabs:**
   - Dashboard
   - Tenders
   - Bidders
   - ❌ NO Audit Logs
   - ❌ NO Users

2. **Dashboard shows:**
   - Zero tenders
   - Zero bidders
   - Empty state message: "No tenders yet. Create your first tender to get started"

3. **Tenders page shows:**
   - Empty state: "No tenders yet. Create your first tender by clicking the '+ New Tender' button above"

4. **Bidders page shows:**
   - Empty state: "No bidders yet. Add bidders to participate in tenders"

## Test Scenario 3: Staff Creates Data

### As Staff User
1. **Create a tender:**
   - Click "+ New Tender"
   - Upload Excel file or enter manually
   - Submit

2. **Create a bidder:**
   - Go to Bidders page
   - Click "+ Add Bidder"
   - Fill in details
   - Submit

### Expected Behavior
- Staff can see their own tender
- Staff can see their own bidder
- Dashboard updates with their statistics

## Test Scenario 4: Data Isolation

### Test 1: Staff Cannot See Admin Data
1. Login as admin
2. Create a tender
3. Logout
4. Login as staff
5. **Expected:** Staff CANNOT see admin's tender

### Test 2: Staff Cannot See Other Staff Data
1. Create a second staff user (as admin):
   - Go to Users page
   - Add new user with STAFF role
2. Login as first staff user, create tender
3. Logout, login as second staff user
4. **Expected:** Second staff CANNOT see first staff's tender

### Test 3: Admin Sees All Data
1. Login as admin
2. Go to Tenders page
3. **Expected:** Admin sees ALL tenders (admin + all staff tenders)

## Test Scenario 5: Security Testing

### Test URL Hacking (as Staff)
1. Login as staff
2. Try to access admin-only pages directly:
   - http://localhost:5173/audit
   - http://localhost:5173/users
3. **Expected:** Redirected to dashboard

### Test API Ownership (as Staff)
1. Login as staff
2. Note a tender ID created by admin (e.g., ID: 1)
3. Try to edit admin's tender via API:
```bash
curl -X PATCH http://localhost:3000/api/tenders/1 \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hacked"}'
```
4. **Expected:** 403 Forbidden or 404 Not Found

## Test Scenario 6: Admin Capabilities

### As Admin User
1. **View all tenders:**
   - Should see tenders created by admin
   - Should see tenders created by all staff users

2. **Manage users:**
   - Create new staff user
   - Edit user roles
   - Deactivate/activate users
   - Delete users

3. **View audit logs:**
   - See all system actions
   - Filter by user, action, entity

## Verification Checklist

### Admin User ✓
- [ ] Can see all sidebar tabs
- [ ] Can view all tenders (admin + staff)
- [ ] Can view all bidders (admin + staff)
- [ ] Can create/edit/delete any tender
- [ ] Can create/edit/delete any bidder
- [ ] Can access audit logs
- [ ] Can manage users

### Staff User ✓
- [ ] Sees limited sidebar (Dashboard, Tenders, Bidders only)
- [ ] Starts with empty dashboard
- [ ] Can create tenders (visible only to them)
- [ ] Can create bidders (visible only to them)
- [ ] Cannot see admin tenders
- [ ] Cannot see other staff tenders
- [ ] Cannot access audit logs (URL blocked)
- [ ] Cannot access users page (URL blocked)
- [ ] Cannot edit/delete admin data
- [ ] Cannot edit/delete other staff data

### Data Isolation ✓
- [ ] Staff A cannot see Staff B's data
- [ ] Staff cannot see admin data
- [ ] Admin can see all data
- [ ] Ownership enforced at API level
- [ ] Ownership enforced at UI level

## Common Issues & Solutions

### Issue: Staff sees admin data
**Solution:** Check that backend routes are filtering by `createdBy`

### Issue: Staff can access admin pages
**Solution:** Check frontend route protection in App.jsx

### Issue: Database errors
**Solution:** Run `npx prisma db push --force-reset` and `npm run seed`

### Issue: Empty dashboard for admin
**Solution:** Admin should see all data. Check stats route filtering logic.

## Quick Reset (If Needed)

```bash
# Reset database and reseed
cd c:\Users\Oumer\Desktop\auction
npx prisma db push --force-reset
npm run seed

# Restart servers
npm run dev
cd frontend && npm run dev
```

## Success Indicators

✅ Admin sees "Total Tenders: X" (all tenders)
✅ Staff sees "Total Tenders: 0" (on first login)
✅ Staff creates tender → count increases to 1
✅ Admin still sees all tenders including staff's
✅ Second staff user sees "Total Tenders: 0"
✅ Sidebar changes based on role
✅ URL hacking prevented
✅ API ownership validated
