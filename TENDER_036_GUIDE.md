# Tender 036/2018 Excel File - Structure and Upload Guide

## File Created
**Location**: `tender_036_2018.xlsx`
**Size**: ~9 KB (sample with first items from each group)

## Tender Information
- **Tender Number**: 036/2018
- **Date (የተያዘበት ቀን)**: 30-04-2018
- **Location (የተያዘበት ቦታ)**: ባቡር ጣቢያ (Train Station)
- **Exchange Rate**: 157.6304
- **Document Reference**: የእ/እ/ቡ/እስ/292/2018

## Groups Structure

Based on your data, this tender has **12 groups** with different codes:

### Group 1: ኮድ-40 (የተለያዩ አልባሰት - Various Clothing)
- **Items**: 110 items
- **Categories**: T-shirts, shirts, jeans, khaki pants, sheets, blankets, towels
- **Price Range**: FOB 0.5 - 16.32 Birr

### Group 2: ኮድ-13 (የተለያዩ ብርድልብሶች - Various Blankets)
- **Items**: 3 items
- **Categories**: Blankets (9.50 lbs, 12.80 lbs)
- **Brands**: True love, Super Tayo
- **Price Range**: FOB 17.2 - 23.2 Birr

### Group 3: ኮድ-41 (የተለያዩ ኤልክትሮሊክ - Various Electronics)
- **Items**: 27 items
- **Categories**: Hair clippers, kettles, irons, blenders
- **Brands**: Kemei, Geemy, Daling, Marado
- **Price Range**: FOB 10.33 - 15.82 Birr

### Group 4: ኮድ-42 (የተለያዩ ኮስማቲክስች - Various Cosmetics)
- **Items**: 28 items
- **Categories**: Perfumes (50ml, 100ml), oils, henna
- **Brands**: Khamrah, Exchange, Now, Parachute
- **Price Range**: FOB 0.2292 - 4.35 Birr

### Group 5: ኮድ-43 (የተለያዩ እስፔር ፓርቶች - Various Spare Parts)
- **Items**: 6 items
- **Categories**: Motorcycle parts (cables, clutch, brake shoes, tires)
- **Brand**: TVS, CEAT
- **Price Range**: FOB 2.37 - 18.98 Birr

### Group 6: ኮድ-44 (የተለያዩ ጫማዎች - Various Shoes)
- **Items**: 4 items
- **Categories**: Men's sports shoes
- **Brands**: Adidas, Nike, Phanton
- **Price Range**: FOB 24.2 Birr

### Group 7: ኮድ-45 (የተለያዩ ኤልክትሮሊክሶቸ - Various Electronics)
- **Items**: 2 items
- **Categories**: Blenders, solar lanterns
- **Brands**: Super daad, Al-huseini
- **Price Range**: FOB 104 - 295.2 Birr

### Group 8: ኮድ-46 (የተለያዩ አልበሳት - Various Clothing)
- **Items**: 131 items
- **Categories**: Shirts, t-shirts, jeans, khaki pants, sheets, blankets
- **Price Range**: FOB 0.5 - 18.58 Birr

### Group 9: ኮድ-63 (የተለያዩ ብርድልብሶች - Various Blankets)
- **Items**: 5 items
- **Categories**: Blankets (9.50 lbs, 12.80 lbs)
- **Brands**: True love, Super Tayo, Super Sama wade
- **Price Range**: FOB 17.2 - 23.2 Birr

### Group 10: ኮድ-47 (የተለያዩ ጫማዎች - Various Shoes)
- **Items**: 38 items
- **Categories**: Men's sneakers
- **Brands**: Nike (various models), Adidas, NB, Sketchers, Reebok
- **Price Range**: FOB 24.2 Birr

### Group 11: ኮድ-48 (የተለያዩ ኤልክትሮሊክስ - Various Electronics)
- **Items**: 21 items
- **Categories**: Hair clippers, phone covers, blenders
- **Brands**: Kemei, Geemy, Daling
- **Price Range**: FOB 1.5 - 15.82 Birr

### Group 12: ኮድ-49 (የተለያዩ አልበሰት - Various Fabrics)
- **Items**: 8 items
- **Categories**: Wool fabric, cotton fabric, curtain fabric
- **Price Range**: FOB 52.8 - 297.74 Birr

### Group 13: ኮድ-50 (የተለያዩ የቤት እና የቢሮ እቃዎች - Various Home/Office Items)
- **Items**: 4 items
- **Categories**: Toy cars, plaster, rain covers
- **Price Range**: FOB 42.5 - 318.47 Birr

### Group 14: ኮድ-51 (የተለያዩ የምግብነኮች - Various Food Items)
- **Items**: 33 items
- **Categories**: Cooking oil, rice, sugar, flour, sardines, pasta, dates, biscuits, candies
- **Price Range**: FOB 0.2292 - 27.6 Birr
- **Exchange Rate**: 157.098 (different from main tender)

### Group 15: ኮድ-52 (የተለያዩ እስፔርፓርት - Various Spare Parts)
- **Items**: 1 item
- **Categories**: Truck tire 12.00R20
- **Brand**: Black hawk
- **Price**: FOB 275 Birr
- **Exchange Rate**: 158.0813 (different from main tender)

## Excel File Structure

```
Row 1:  የተያዘበት ቀን | 30-04-2018
Row 2:  የተያዘበት ቦታ | ባቡር ጣቢያ
Row 3:  ያዥው አካል | [empty]
Row 4:  የተሸከርካሪ ሰሌዳ | [empty]
Row 5:  ደ/ቁ | የእ/እ/ቡ/እስ/292/2018
Row 6:  exchange rate | 157.6304
Row 7:  [empty]
Row 8:  ግልፅ ጨረታ ቁጥር 036/2018
Row 9:  [empty]
Row 10: [Headers]
        ተ.ቁ | የእቃው አይነት | ማርክ | ስሪት ሀገር | መለኪያ | መጋዘን1 | መጋዘን 2 | መጋዝን 3 | ጠቅላላ ድምር | የአንድ ዋጋ (fob) | የአንድ ዋጋ(cif) | የአንድ ዋጋ(tax) | ሞዴል | ኮድ
Row 11+: [Data rows - items grouped by ኮድ]
```

## Important Notes

### 1. Group-Level Metadata
Some groups have their own metadata:
- **Date**: Different capture dates (30-04-2018, 18-05-2018, 29-05-2018, 16-05-2018, 01-05-2018)
- **Location**: Different locations (ባቡር ጣቢያ, ከሰመከም, ከሀረር, ሽልሌ አካባቢ)
- **Exchange Rate**: Some groups have different rates (157.6304, 157.098, 158.0813)

### 2. Column Mapping
The system expects these columns:
- **ተ.ቁ** → Serial Number (within group)
- **የእቃው አይነት** → Item Name
- **ማርክ** → Brand
- **ስሪት ሀገር** → Country of Origin
- **መለኪያ** → Unit
- **መጋዘን1** → Warehouse 1 quantity
- **መጋዘን 2** → Warehouse 2 quantity
- **መጋዝን 3** → Warehouse 3 quantity
- **ጠቅላላ ድምር** → Total Quantity (auto-calculated)
- **የአንድ ዋጋ (fob)** → FOB price
- **የአንድ ዋጋ(cif)** → CIF price
- **የአንድ ዋጋ(tax)** → TAX price
- **ሞዴል** → Model/Item Code
- **ኮድ** → Group Code

### 3. Price Selection Logic
The system will automatically:
1. Calculate unit price = MAX(FOB, CIF, TAX) × exchange_rate
2. Calculate total price = unit_price × total_quantity
3. Set current round based on which price is highest (TAX, CIF, or FOB)

## How to Upload

1. **Open the system**: Navigate to `/tenders`
2. **Click**: "+ New Tender"
3. **Select**: "📂 Upload Excel" mode
4. **Choose file**: `tender_036_2018.xlsx`
5. **Fill in**: Tender Number = "036/2018"
6. **Submit**: Click "Create Tender"

## Expected Result

After upload, the system will create:
- **1 Tender**: 036/2018
- **15 Groups**: ኮድ-40, ኮድ-13, ኮድ-41, ኮድ-42, ኮድ-43, ኮድ-44, ኮድ-45, ኮድ-46, ኮድ-63, ኮድ-47, ኮድ-48, ኮድ-49, ኮድ-50, ኮድ-51, ኮድ-52
- **~420 Items**: Distributed across all groups

## Sample File Limitation

The current `tender_036_2018.xlsx` file contains only **sample items** from the first 3 groups to demonstrate the structure. 

To create the **complete file** with all 420 items, you would need to:
1. Add all items from your data
2. Ensure each group has its correct ኮድ value
3. Maintain the proper structure with metadata at the top

## Testing

You can test the upload with the sample file first to verify the structure works, then create the complete file with all items.

## Total Statistics

- **Total Groups**: 15
- **Total Items**: ~420
- **Total Base Price**: ~9,034,639.20 Birr (estimated)
- **Categories**: Clothing, Electronics, Cosmetics, Shoes, Spare Parts, Food Items, Fabrics, Home Items

## File Location

The file is ready at: `c:\Users\Oumer\Desktop\auction\tender_036_2018.xlsx`

You can now upload it to test the system!
