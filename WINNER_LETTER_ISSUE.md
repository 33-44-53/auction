# Winner Letter Empty Issue - Root Cause & Solution

## Problem
Winner letter downloads but appears empty or shows corrupted text.

## Root Causes

### 1. Corrupted Template Path
```javascript
// WRONG (corrupted):
const templatePath = path.join(__dirname, '../../ <" ^~ ^, S>  <ø % <ø <3 %\u000F winnerformat.docx');

// CORRECT:
const templatePath = path.join(__dirname, '../../የመሸኛ_ደብደዳቤ_winnerformat.docx');
```

### 2. Corrupted Amharic Text in Fallback Function
The `createWinnerLetterFromScratch` function has garbled Amharic characters due to encoding issues during file save/transfer.

### 3. Template Placeholders Not Matching
If template exists but placeholders don't match, the document renders empty.

## Solution

### Option 1: Use Template with Background (Recommended)
1. Ensure template file exists: `የመሸኛ_ደብደዳቤ_winnerformat.docx`
2. Template must have these placeholders:
   - `{refNumber}` - Tender number/Group code
   - `{date}` - Ethiopian date
   - `{tenderNumber}` - Tender number
   - `{winnerName}` - Winner's name
   - `{groupCode}` - Group code
   - `{itemDescription}` - Items description
   - `{winnerPrice}` - Winner price formatted
   - `{calc70}` - 70% calculation
   - `{calc30}` - 30% calculation
   - `{vat}` - 15% VAT
   - `{totalWithVAT}` - Total with VAT

### Option 2: Fallback (No Template)
Use the clean Amharic text from `WINNER_LETTER_FIX.js`

## How to Apply Fix

### Step 1: Replace Winner Letter Endpoint
In `src/routes/export.js`, find the `router.get('/winner-letter/:groupId'` endpoint and replace it with the code from `WINNER_LETTER_FIX.js`

### Step 2: Replace Fallback Function
Replace the `createWinnerLetterFromScratch` function with the clean version from `WINNER_LETTER_FIX.js`

### Step 3: Verify Template File
Check if `የመሸኛ_ደብደዳቤ_winnerformat.docx` exists in project root. If not, the fallback will create a document without background.

## Testing

1. Close a group (select winner)
2. Click "Winners Excel" button - should download with data
3. Click "Winner Letter" button - should download Word document
4. Open document - should show:
   - Proper Amharic text
   - Winner name
   - Prices (70%, 30%, VAT, Total)
   - Instructions
   - Distribution list

## Expected Output

```
ቁጥር/Ref.No: 035/2018/ኮድ-21
ቀን/Date: 04/07/2018

ለገቢ አሰባሰብ እና ዋስትና አያያዝ ቡድን

ጉዳዩ፡ በግልፅ ጨረታ የተሸነፈ እቃ ክፍያ

በድሬ/ዳዋ/ጉምሩክ ቅርንጫፍ ቢሮ ቁጥር 035/2018 በ04/07/2018 ዓ.ም በተካሄደ ግልፅ ጨረታ 
አቶ ሀይሌ ገ/ኪዳን በኮድ-21 የተለያዩ የምግብ ነክ በብር 4,375,000.00 ያሸነፉ ሲሆን...

70% ---------------------------------------------------- 3,062,500.00
30% ---------------------------------------------------- 1,312,500.00
15% (ቫት) --------------------------------------------- 656,250.00
ጠቅላላ ክፍያ ------------------------------------------- 5,031,250.00

[Instructions in Amharic...]

፡፡ የእርሶ ታማኝ ቢሮ፡፡

ግልባጭ፡-
ለጉ/ኦ/ም/ስ/አስኪየጅ
የተያዙና የተወረሱ ንብ/አስ/የስራሂደት
ለንብረት አስወጋጅ ኮሚቴ
ድሬደዋ
አቶ ሀይሌ ገ/ኪዳን
ባሉበት
በ/መ

"ደረጃውን የጠበቀ ዘመናዊ የጉምሩክ አስተዳደር እንዲሰፍን እንተጋለን"
```

## Why Yasbela Letter Works But Winner Letter Doesn't

1. **Yasbela letter was just created** - has clean Amharic text
2. **Winner letter is older** - text got corrupted during file encoding/transfer
3. **Both need template support** - for background image

## Files to Update
- `src/routes/export.js` - Replace winner letter endpoint and fallback function
- Use code from: `WINNER_LETTER_FIX.js`
