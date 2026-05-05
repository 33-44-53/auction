# Exchange Rate Update - Item-Specific Only

## Summary
Updated the system to enforce that ALL items must have their own exchange rate from the Excel file. Removed all fallback logic to group-level or tender-level exchange rates.

## Changes Made

### 1. Excel Parser (`src/utils/excelParser.js`)
- Removed fallback to `tenderMeta.exchangeRate` in `parseItemRow()` function
- Items now only use their own exchange rate from the Exchange Rate column
- Returns `null` if exchange rate is not provided in Excel

### 2. Tender Routes (`src/routes/tender.js`)
- **Main tender upload**: Added validation to throw error if any item is missing exchange rate
- **Group upload to existing tender**: Same validation added
- Removed all fallback logic (`groupExchangeRate || 1`)
- Clear error messages showing which item is missing exchange rate

### 3. Group Routes (`src/routes/group.js`)
- **Upload items Excel**: Validates each item has exchange rate, returns 400 error if missing
- **Update item**: Requires exchange rate parameter, returns error if not provided
- **Next round**: Validates all items have exchange rates before creating new group/tender

### 4. Documentation (`README.md`)
- Updated Calculations section to clarify items MUST have their own exchange rate
- Removed mention of fallback behavior

## Price Calculation (Updated)

```javascript
// 1. Select price based on round
selected_price = CIF or FOB or TAX (based on current round)

// 2. Calculate unit price using ITEM'S OWN exchange rate
unit_price = selected_price × item_exchange_rate

// 3. Calculate total price
total_price = unit_price × total_quantity

// 4. Group base price
base_price = SUM(total_price of all items in group)
```

## Validation Rules

✅ Every item MUST have exchange rate in Excel file  
✅ Upload will fail with clear error message if any item is missing exchange rate  
✅ Item update requires exchange rate parameter  
✅ Next round operation validates all items have exchange rates  

## Error Messages

- Excel upload: `"Item \"[name]\" in group [code] is missing exchange rate. All items must have an exchange rate in the Excel file."`
- Item update: `"Exchange rate is required for each item"`
- Next round: `"Item \"[name]\" is missing exchange rate. Cannot proceed to next round."`

## Migration Notes

- Existing items in database may have `null` exchange rates
- New uploads will enforce exchange rate requirement
- Consider running data migration to populate missing exchange rates if needed

## Testing Checklist

- [ ] Upload Excel with all items having exchange rates - should succeed
- [ ] Upload Excel with missing exchange rate - should fail with clear error
- [ ] Update item without exchange rate - should fail
- [ ] Move group to next round with items missing exchange rates - should fail
- [ ] Verify calculations use only item-specific exchange rates

## Date
January 2025
