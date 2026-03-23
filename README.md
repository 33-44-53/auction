# Tender Management System

A secure, production-level Tender Management System for procurement of imported goods.

## Features

- **Multi-level Tender Structure**: Tender → Groups (ኮድ-10) → Items
- **Price Selection**: Automatic selection of highest price (MAX of CIF, FOB, TAX)
- **CIF → FOB → TAX Round System**: Progressive bidding rounds
- **Group-level Bidding**: Independent bidding units with winner selection
- **Group Splitting**: Split large groups into smaller units
- **Excel Upload**: Handle Amharic headers, merged cells, multi-row headers
- **Excel/PDF Export**: Recreate exact format with proper styling
- **Security**: JWT authentication, Role-based access control (RBAC), Audit logs

## Tech Stack

- **Backend**: Node.js, Express, Prisma ORM, SQLite
- **Frontend**: React, Tailwind CSS, Vite
- **Security**: bcryptjs, jsonwebtoken

## Project Structure

```
auction/
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.js           # Seed data
├── src/
│   ├── server.js        # Express server
│   ├── middleware/      # Auth, error handling, audit
│   ├── routes/          # API routes
│   └── utils/           # Excel parser
├── frontend/            # React application
├── uploads/             # File uploads
└── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm

### Backend Setup

1. Install dependencies:
```bash
cd auction
npm install
```

2. Generate Prisma client and run migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

3. Seed the database (creates admin and sample data):
```bash
npm run seed
```

4. Start the backend server:
```bash
npm run dev
```

Server will run on http://localhost:3000

### Frontend Setup

1. Install frontend dependencies:
```bash
cd frontend
npm install
```

2. Start the frontend:
```bash
npm run dev
```

Frontend will run on http://localhost:5173

## Default Credentials

- **Admin**: admin@tender.com / admin123
- **Staff**: staff@tender.com / staff123

## API Endpoints

### Authentication
- POST `/api/auth/login` - Login
- POST `/api/auth/register` - Register (admin only)
- GET `/api/auth/me` - Get current user

### Tenders
- GET `/api/tenders` - List all tenders
- POST `/api/tenders` - Create tender (with Excel upload)
- GET `/api/tenders/:id` - Get tender details
- PATCH `/api/tenders/:id` - Update tender
- DELETE `/api/tenders/:id` - Delete tender (admin only)

### Groups
- GET `/api/groups/:id` - Get group details
- POST `/api/groups/:id/bidders` - Add bidder to group
- POST `/api/groups/:id/bids` - Submit bid
- POST `/api/groups/:id/select-winner` - Select winner
- POST `/api/groups/:id/next-round` - Move to next round
- POST `/api/groups/:id/split` - Split group (admin only)

### Bidders
- GET `/api/bidders` - List all bidders
- POST `/api/bidders` - Create bidder (admin/staff)
- PATCH `/api/bidders/:id` - Update bidder
- DELETE `/api/bidders/:id` - Delete bidder (admin only)

### Export
- GET `/api/export/excel/:tenderId` - Export to Excel
- GET `/api/export/pdf/:tenderId` - Export to PDF

### Audit
- GET `/api/audit` - List audit logs (admin only)

## Roles

- **ADMIN**: Full access to all features
- **STAFF**: Manage tenders, groups, bids (cannot delete)
- **VIEWER**: Read-only access

## Business Logic

### Price Selection
For each item, the system automatically selects the highest price:
- Price = MAX(CIF, FOB, TAX)

### Calculations
```
unit_price = selected_price × exchange_rate
total_price = unit_price × quantity
```

### Group Base Price (መነሻ ዋጋ)
```
base_price = SUM(total_price of all items in group)
```

### Round System
1. **1st Round**: CIF (highest)
2. **2nd Round**: FOB
3. **3rd Round**: TAX

### Bidding Rules
- Bidders are assigned per GROUP
- Each bidder submits ONE price per group per round
- Winner = bidder with HIGHEST bid_price
- bid_price must be >= base_price

## Excel Format

The system accepts Excel files with the following structure:
- Tender Number
- Exchange Rate
- Groups (ኮድ-10)
- Items with Item Code (52155...), Name, Brand, Country, Unit, Quantity, FOB, CIF, Tax

Amharic headers are automatically detected and parsed.

## Security Features

1. **JWT Authentication**: Token-based login
2. **Password Hashing**: bcrypt with 12 rounds
3. **Role-based Access**: ADMIN, STAFF, VIEWER
4. **Input Validation**: Express-validator
5. **Audit Logging**: Track all important actions
6. **File Security**: Path traversal prevention

## License

MIT