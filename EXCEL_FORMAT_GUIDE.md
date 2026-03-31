# Excel Upload Format Guide

## Required Excel Structure

The system accepts Excel files (.xlsx, .xls) with the following structure:

### 1. Metadata Section (Top rows before headers)

These fields are **automatically extracted from the Excel file**. Place them in the first few rows as key-value pairs:

| Field | Amharic | Required | Example |
|-------|---------|----------|----------|
| Tender Number | የጨረታ ቁጥር | ✅ Yes | TND-2024-001 |
| Title | የጨረታ ስም | ✅ Yes | Medical Equipment Procurement |
| Date | ቀን | ✅ Yes | 2024-01-15 |
| Location | ቦታ | ✅ Yes | Dire Dawa |
| Responsible Body | ያዥው አካል | ✅ Yes | Health Bureau |
| Exchange Rate | የምንዛሪ | ✅ Yes | 55.5 |

**Example:**
```
Tender Number    TND-2024-001
የጨረታ ስም          Medical Equipment Procurement
Exchange Rate    55.5
Date             2024-01-15
Location         Dire Dawa
ያዥው አካል          Health Bureau
```

**Important:** All tender information (tender number, date, location, responsible body, exchange rate, title) is read from the Excel file. You don't need to enter them manually in the form.

---

### 2. Header Row (Column Names)

The header row can use either English or Amharic column names:

| English | Amharic | Required | Description |
|---------|---------|----------|-------------|
| Code / Group Code | ኮድ | ✅ Yes | Group identifier (e.g., 10, 20, 30) |
| Group Name | ስም | Optional | Group description |
| Item Code | Item Code | Optional | Item identifier (e.g., 52155...) |
| Serial No | ተ.ቁ | Optional | Serial number |
| Item Name | ዕቃ / የእቃው አይነት | ✅ Yes | Item description |
| Item Type | የእቃው አይነት | Optional | Type of item |
| Brand | ምርት / ማርክ | Optional | Brand name |
| Country | ሀገር / ስሪት ሀገር | Optional | Country of origin |
| Unit | አሃድ / መለኪያ | Optional | Unit of measure (EA, KG, etc.) |
| Warehouse 1 | መጋዘን 1 | Optional | Quantity in warehouse 1 |
| Warehouse 2 | መጋዘን 2 | Optional | Quantity in warehouse 2 |
| Warehouse 3 | መጋዘን 3 | Optional | Quantity in warehouse 3 |
| Qty / Quantity | ብዛት / ጠቅላላ ድምር | ✅ Yes | Total quantity |
| FOB | FOB / ኤፍኦቢ | ✅ Yes | FOB price |
| CIF | CIF / ሲአይኤፍ | ✅ Yes | CIF price |
| Tax | Tax / ግብር | ✅ Yes | Tax amount |

---

### 3. Data Rows (Items)

Each row represents an item. Items are grouped by the **Code** column:

- When a **Code** value appears, it starts a new group
- All following rows (until the next Code) belong to that group
- Each group can have multiple items

**Example Structure:**

| Code | Group Name | Item Code | Item Name | Brand | Country | Unit | Qty | FOB | CIF | Tax |
|------|------------|-----------|-----------|-------|---------|------|-----|-----|-----|-----|
| 10 | Medical Equipment | 52155001 | Stethoscope | 3M | USA | EA | 50 | 25.00 | 30.00 | 5.00 |
|  |  | 52155002 | Blood Pressure Monitor | Omron | Japan | EA | 30 | 45.00 | 50.00 | 8.00 |
|  |  | 52155003 | Thermometer | Braun | Germany | EA | 100 | 10.00 | 12.00 | 2.00 |
| 20 | Laboratory Equipment | 52156001 | Microscope | Olympus | Japan | EA | 10 | 500.00 | 550.00 | 100.00 |
|  |  | 52156002 | Centrifuge | Eppendorf | Germany | EA | 5 | 800.00 | 900.00 | 150.00 |
| 30 | Surgical Tools | 52157001 | Scalpel Set | Aesculap | Germany | SET | 20 | 75.00 | 85.00 | 15.00 |

---

## Complete Example

Here's what a complete Excel file should look like:

```
Row 1:  Tender Number          TND-2024-001
Row 2:  የጨረታ ስም                Medical Equipment Procurement
Row 3:  Exchange Rate          55.5
Row 4:  Location               Dire Dawa
Row 5:  Responsible Body       Health Bureau
Row 6:  Date                   2024-01-15
Row 7:  [Empty]
Row 8:  ኮድ | ስም | Item Code | ዕቃ | ምርት | ሀገር | አሃድ | መጋዘን 1 | መጋዘን 2 | መጋዘን 3 | ብዛት | FOB | CIF | Tax
Row 9:  10 | Medical Equipment | 52155001 | Stethoscope | 3M | USA | EA | 20 | 15 | 15 | 50 | 25.00 | 30.00 | 5.00
Row 10:    |                   | 52155002 | BP Monitor | Omron | Japan | EA | 10 | 10 | 10 | 30 | 45.00 | 50.00 | 8.00
Row 11:    |                   | 52155003 | Thermometer | Braun | Germany | EA | 50 | 30 | 20 | 100 | 10.00 | 12.00 | 2.00
Row 12: 20 | Lab Equipment | 52156001 | Microscope | Olympus | Japan | EA | 5 | 3 | 2 | 10 | 500.00 | 550.00 | 100.00
Row 13:    |               | 52156002 | Centrifuge | Eppendorf | Germany | EA | 2 | 2 | 1 | 5 | 800.00 | 900.00 | 150.00
```

---

## Important Notes

### ✅ Supported Features
- **Amharic headers** - System auto-detects Amharic column names
- **Merged cells** - Group codes can span multiple rows
- **Multi-row headers** - Headers can be on any row (system auto-detects)
- **Mixed languages** - Can mix English and Amharic column names
- **Flexible column order** - Columns can be in any order
- **Warehouse quantities** - System sums warehouse1 + warehouse2 + warehouse3 if total quantity is not provided

### ⚠️ Requirements
- **Group Code (ኮድ)** column is mandatory
- **Item Name (ዕቃ)** column is mandatory
- **Quantity (ብዛት)** column is mandatory
- **FOB, CIF, Tax** columns are mandatory
- At least one group with at least one item

### 📝 Tips
- Leave Code column empty for items belonging to the same group
- System automatically prefixes group codes with "ኮድ-" (e.g., 10 becomes ኮድ-10)
- Prices can include currency symbols ($, €, £, ¥) - they will be stripped
- Quantities can include commas (1,000) - they will be parsed correctly
- Empty rows are automatically skipped
- If no unit is specified, defaults to "EA" (Each)

---

## Sample Excel Template

A sample Excel template is available in the project:
- Download: `auction/sample_tender_template.xlsx`
- Or create your own following this guide

---

## Upload Process

1. Go to **Create Tender** page
2. Click **Upload Excel File** and select your file
3. System will **automatically extract** all information from Excel:
   - Tender Number
   - Exchange Rate
   - Title
   - Date
   - Location
   - Responsible Body
4. System will:
   - Parse metadata from top rows
   - Detect header row automatically
   - Group items by Code column
   - Calculate base prices for each group
   - Create tender with all groups and items

**Note:** All fields are read from Excel. Manual form entry is only used as fallback if Excel doesn't contain the information.

---

## Troubleshooting

### "Could not find valid header row"
- Ensure you have column headers with at least: Code (ኮድ), Item Name (ዕቃ), Quantity (ብዛት)
- Headers should be in the first 20 rows

### "Could not find group code column"
- Add a column named "Code", "ኮድ", or "Group Code"
- This column identifies which group each item belongs to

### "No valid groups found"
- Ensure at least one row has a value in the Code column
- Check that items have required fields: name, quantity, FOB, CIF, Tax

### Items not grouping correctly
- Make sure the Code column is empty for items belonging to the same group
- Only put the group code in the first item of each group

---

## Example Files

Check the `examples/` folder for sample Excel files:
- `medical_equipment.xlsx` - Medical equipment tender
- `office_supplies.xlsx` - Office supplies tender
- `construction_materials.xlsx` - Construction materials tender
