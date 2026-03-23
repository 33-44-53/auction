# 🎯 Tender Management System - Complete Setup Guide

## ✅ System is 100% Ready

Your tender management system is fully implemented with all features working:

### What's Working:
- ✅ Backend API (Node.js + Express + Prisma + SQLite)
- ✅ Frontend UI (React + Vite + Tailwind CSS)
- ✅ Authentication (JWT + Role-based access)
- ✅ Tender management (Upload Excel, parse groups/items)
- ✅ Group-based bidding (CIF → FOB → TAX rounds)
- ✅ Winner selection (highest bid)
- ✅ Group splitting
- ✅ Excel/PDF export with Amharic support
- ✅ Audit logging
- ✅ User management
- ✅ Bidder management
- ✅ Dashboard analytics

---

## 🚀 Quick Start

### 1. Start Backend (Terminal 1)
```bash
cd c:\Users\Oumer\Desktop\auction
npm run dev
```

Server will start on: **http://localhost:3000**

### 2. Start Frontend (Terminal 2)
```bash
cd c:\Users\Oumer\Desktop\auction\frontend
npm run dev
```

Frontend will start on: **http://localhost:5173**

### 3. Login
Open browser: **http://localhost:5173**

**Default Credentials:**
- Admin: `admin@tender.com` / `admin123`
- Staff: `staff@tender.com` / `staff123`

---

## 📊 How to Use the System

### Step 1: Upload Tender (Admin/Staff)
1. Click "📤 ጨረታ አስገባ" (Upload Tender)
2. Fill in:
   - Tender Number (e.g., "T-2024-001")
   - Location (e.g., "አዲስ አበባ")
   - Exchange Rate (e.g., 157.63)
   - Date
3. Upload Excel file with Amharic headers
4. System automatically:
   - Parses groups (ኮድ-10, ኮድ-11, etc.)
   - Parses items (itemCode, name, brand, FOB, CIF, TAX)
   - Calculates prices: `MAX(CIF, FOB, TAX) × exchangeRate`
   - Calculates base price per group: `SUM(all item.totalPrice)`

### Step 2: View Tender
1. Click on tender card from dashboard
2. See all groups with:
   - Code (ኮድ-10)
   - Status (OPEN/SOLD/SPLIT)
   - Round (CIF/FOB/TAX)
   - Base Price (መነሻ ዋጋ)
   - Bidders count
   - Highest bid
   - Winner

### Step 3: Manage Group
1. Click "ክፈት →" on any group
2. You can:
   - **Add bidders** to group (from bidders list)
   - **Submit bids** for assigned bidders
   - **Select winner** (highest bid)
   - **Move to next round** (CIF → FOB → TAX)
   - **Split group** into sub-groups
   - **Add items** manually
   - **Delete items**

### Step 4: Bidding Process
1. Admin assigns bidders to group
2. Bidders submit bids (must be >= base price)
3. System shows bids ranked by price (highest first)
4. Admin selects winner (must be highest bid)
5. Group status changes to "SOLD"

### Step 5: Round System (If Not Sold)
1. If no winner in CIF round → Click "ወደ የሚቀጥለው ዙር"
2. System moves to FOB round
3. Base price recalculates using FOB prices
4. New bidders can be added
5. If still not sold → Move to TAX round (final)

### Step 6: Export Reports
1. Click "Export Excel" → Downloads Excel with Amharic headers
2. Click "Export PDF" → Downloads PDF report
3. Both include:
   - Tender info
   - All groups
   - All items
   - All bids
   - Winners

---

## 👥 User Roles

### ADMIN (Full Access)
- Create/edit/delete tenders
- Manage groups (add, split, delete)
- Manage bidders (add, edit, delete)
- Manage users (create, edit roles, delete)
- Submit bids
- Select winners
- View audit logs
- Export reports

### STAFF (Limited Access)
- Create/edit tenders
- Manage groups (add, split)
- Manage bidders (add, edit)
- Submit bids
- Select winners
- Export reports
- Cannot delete or view audit logs

### VIEWER (Read-Only)
- View tenders
- View groups
- View bids
- Export reports
- Cannot create, edit, or delete anything

---

## 📁 Excel File Format

Your Excel file should have:

### Headers (Amharic or English):
- **ኮድ** or **Code** → Group code (e.g., "10", "ኮድ-10")
- **ቁም ቁረጠ** or **Item Code** → Item code (e.g., "52155")
- **ዕቃ** or **Item** → Item name
- **ምርት** or **Brand** → Brand name
- **ሀገር** or **Country** → Country of origin
- **አሃድ** or **Unit** → Unit (EA, KG, etc.)
- **ቁም** or **Qty** → Quantity
- **FOB** → FOB price
- **CIF** → CIF price
- **Tax** or **ግብር** → Tax price

### Example Structure:
```
ኮድ-10
ቁም ቁረጠ | ዕቃ        | ምርት  | ቁም | FOB  | CIF  | Tax
52155    | Computer  | Dell | 10  | 500  | 550  | 480
52156    | Monitor   | HP   | 20  | 200  | 220  | 190

ኮድ-11
ቁም ቁረጠ | ዕቃ        | ምርት  | ቁም | FOB  | CIF  | Tax
52157    | Keyboard  | Logitech | 50  | 30   | 35   | 28
```

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (admin only)
- `GET /api/auth/me` - Get current user

### Tenders
- `GET /api/tenders` - List all
- `GET /api/tenders/:id` - Get details
- `POST /api/tenders` - Create (with Excel upload)
- `PATCH /api/tenders/:id` - Update
- `DELETE /api/tenders/:id` - Delete (admin)

### Groups
- `GET /api/groups/:id` - Get details
- `POST /api/groups` - Create new group
- `POST /api/groups/:id/bidders` - Add bidder
- `DELETE /api/groups/:id/bidders/:bidderId` - Remove bidder
- `POST /api/groups/:id/bids` - Submit bid
- `POST /api/groups/:id/select-winner` - Select winner
- `POST /api/groups/:id/next-round` - Move to next round
- `POST /api/groups/:id/split` - Split group
- `POST /api/groups/:id/items` - Add item
- `DELETE /api/groups/:id/items/:itemId` - Delete item

### Bidders
- `GET /api/bidders` - List all
- `POST /api/bidders` - Create
- `PATCH /api/bidders/:id` - Update
- `DELETE /api/bidders/:id` - Delete

### Export
- `GET /api/export/excel/:tenderId` - Export Excel
- `GET /api/export/pdf/:tenderId` - Export PDF

### Stats
- `GET /api/stats` - Dashboard analytics

### Users
- `GET /api/users` - List all (admin)
- `POST /api/users` - Create user (admin)
- `PATCH /api/users/:id` - Update role (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Audit
- `GET /api/audit` - List logs (admin)

---

## 🎨 UI Features

### Dashboard
- Tender cards with status badges
- Quick actions (View, Excel, PDF)
- Statistics overview

### Tender Detail
- Tabs: Groups / Items
- Group table with status, round, base price, bids
- Items table grouped by code

### Group Detail
- Current round indicator (CIF/FOB/TAX)
- Base price (መነሻ ዋጋ)
- Bidders list
- Bids table (ranked by price)
- Items table
- Action buttons:
  - Submit bid
  - Next round
  - Select winner
  - Split group (admin)

### Bidders Management
- List all bidders
- Add new bidder (name, company, phone, email, TIN)
- Edit bidder info

### Audit Logs
- All system actions
- User, action, entity, timestamp
- Pagination

---

## 🔐 Security Features

- JWT authentication (24h expiry)
- Password hashing (bcrypt, 12 rounds)
- Role-based access control
- Input validation
- File upload validation (type, size)
- SQL injection prevention (Prisma ORM)
- XSS prevention (React escaping)
- Audit logging for all actions

---

## 📝 Business Logic

### Price Selection
```
For each item:
  selectedPrice = MAX(CIF, FOB, TAX)
  unitPrice = selectedPrice × exchangeRate
  totalPrice = unitPrice × quantity
```

### Group Base Price
```
For each group:
  basePrice = SUM(all item.totalPrice in group)
```

### Round System
```
Round 1: CIF (highest price)
  ↓ (if not sold)
Round 2: FOB (medium price)
  ↓ (if not sold)
Round 3: TAX (lowest price)
```

### Winner Selection
```
Winner = bidder with HIGHEST bid_price in current round
Validation: bid_price >= group.basePrice
```

---

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use npm script
npm run kill-port
```

### Database Issues
```bash
# Reset database
npm run prisma:migrate

# Reseed data
npm run seed
```

### Frontend Not Loading
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📦 Dependencies

### Backend
- express - Web framework
- prisma - ORM
- bcryptjs - Password hashing
- jsonwebtoken - JWT auth
- multer - File upload
- exceljs - Excel generation
- xlsx - Excel parsing
- puppeteer - PDF generation
- express-validator - Input validation

### Frontend
- react - UI library
- react-router-dom - Routing
- axios - HTTP client
- tailwindcss - CSS framework
- lucide-react - Icons

---

## ✅ System is Complete and Ready to Use!

Everything is working. Just start both servers and login.

**Questions?** Check the code or API endpoints above.
