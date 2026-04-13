# Item-Specific Exchange Rate Update

## Summary
Updated the Tender Management System to support **item-specific exchange rates** instead of group-specific rates. Each item can now have its own exchange rate, with fallback to group-level or tender-level rates if not specified.

## Changes Made

### 1. Database Schema (`prisma/schema.prisma`)
- Added `exchangeRate Float?` field to the `Item` model
- Migration file created: `prisma/migrations/20240115000000_add_item_exchange_rate/migration.sql`

### 2. Excel Parser (`src/utils/excelParser.js`)
- Updated to parse Exchange Rate from item rows (last column)
- Modified `parseItemRow()` to accept and store item-specific exchange rates
- Falls back to tender-level exchange rate if item rate is not provided
- Removed exchange rate from group metadata

### 3. Tender Routes (`src/routes/tender.js`)
- Updated item creation logic to use item-specific exchange rates
- Calculation priority: Item Exchange Rate → Group Exchange Rate → Tender Exchange Rate
- Unit price calculation now uses item-specific rate: `unitPrice = selectedPrice × itemExchangeRate`

### 4. Excel Template
- **New Template**: `Tender_Template_ItemExchangeRate.xlsx`
- Exchange Rate column moved to the **LAST COLUMN** (after TAX)
- Each item row can have its own exchange rate value
- Sample data included with different exchange rates per item

### 5. Documentation (`README.md`)
- Updated Excel Format section to document new column structure
- Updated Calculations section to reflect item-specific exchange rates
- Added reference to new template file

## Excel Format

### Column Order (Updated)
```
ኮድ | Title | የተያዘበት ቀን | የተያዘበት ቦታ | ያዥው አካል | ሞዴል | የእቃው አይነት | ማርክ | ስሪት ሀገር | መለኪያ | መጋዘን 1 | መጋዘን 2 | መጋዘን 3 | ጠቅላላ ድምር | (FOB) | (CIF) | (TAX) | Exchange Rate
```

**Key Change**: Exchange Rate is now the **LAST column** (position 18)

## Usage

### For Clients
1. Use the new template: `Tender_Template_ItemExchangeRate.xlsx`
2. Enter exchange rate for each item in the last column
3. If an item doesn't have a specific rate, leave it blank (will use tender-level rate)
4. Upload as usual through the tender creation interface

### Example Data
```
ኮድ-10 | Electronics | ... | 52155001 | Laptop | Dell | USA | EA | 5 | 3 | 2 | 10 | 800 | 850 | 900 | 120.50
       |             | ... | 52155002 | Monitor | Samsung | Korea | EA | 10 | 5 | 5 | 20 | 200 | 220 | 250 | 120.50
       |             | ... | 52155003 | Keyboard | Logitech | China | EA | 15 | 10 | 5 | 30 | 30 | 35 | 40 | 121.00
```

## Migration Steps (Production)

1. **Backup Database** (CRITICAL)
2. Run migration:
   ```bash
   npx prisma migrate deploy
   ```
3. Restart backend service
4. Provide new template to clients

## Backward Compatibility
- Old Excel files without Exchange Rate column will still work
- System falls back to tender-level exchange rate
- No breaking changes to existing data

## Testing Checklist
- [ ] Upload Excel with item-specific exchange rates
- [ ] Verify calculations use correct exchange rate per item
- [ ] Test fallback to tender-level rate when item rate is missing
- [ ] Verify group base price calculation
- [ ] Test export functionality with new field

## Files Modified
1. `prisma/schema.prisma`
2. `src/utils/excelParser.js`
3. `src/routes/tender.js`
4. `README.md`

## Files Created
1. `Tender_Template_ItemExchangeRate.xlsx` (NEW TEMPLATE)
2. `prisma/migrations/20240115000000_add_item_exchange_rate/migration.sql`
3. `ITEM_EXCHANGE_RATE_UPDATE.md` (this file)

---
**Date**: January 15, 2024
**Status**: ✅ Ready for deployment
