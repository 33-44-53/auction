# How to Use Your Background in Winner Letters

## ✅ Good News!
The system is **already configured** to use your `የመሸኛ ደብደዳቤ winnerformat.docx` file as the background!

## 📝 What You Need to Do

### Step 1: Open Your Template
1. Open `የመሸኛ ደብደዳቤ winnerformat.docx` in Microsoft Word
2. You'll see your background, logos, and formatting

### Step 2: Add Placeholders
Replace the text where you want dynamic data with these placeholders:

**Replace this:**
```
ቁጥር/Ref.No: 033/2018/CODE-10
```

**With this:**
```
ቁጥር/Ref.No: {refNumber}
```

**Replace this:**
```
ቀን /Date: 25/08/2017
```

**With this:**
```
ቀን /Date: {date}
```

**Replace this:**
```
ስት አቶ አብዱላሂ መሀመድ
```

**With this:**
```
ስት {winnerName}
```

**Replace this:**
```
በብር 1,234,567.89
```

**With this:**
```
በብር {winnerPrice}
```

### Step 3: All Available Placeholders

Copy and paste these where you need them:

```
{refNumber}      - Reference number (e.g., 033/2018/CODE-10)
{date}           - Date (e.g., 25/08/2017)
{tenderNumber}   - Tender number (e.g., 033/2018)
{winnerName}     - Winner's name
{groupCode}      - Group code (e.g., CODE-10)
{itemDescription} - Item description
{winnerPrice}    - Winning price (formatted with commas)
{calc70}         - 70% of price
{calc30}         - 30% of price
{vat}            - 15% VAT
{totalWithVAT}   - Total with VAT
```

### Step 4: Save the File
1. Click **File → Save**
2. Keep the filename: `የመሸኛ ደብደዳቤ winnerformat.docx`
3. Keep it in: `c:\Users\Oumer\Desktop\auction\`

### Step 5: Test It
1. Go to your system
2. Find a SOLD group
3. Click "📄 Winner Letter"
4. Download the document
5. **Your background will be there with the data filled in!**

## 🎯 Example

**Before (in your template):**
```
ቁጥር/Ref.No: _____________
ቀን /Date: _____________

በቅ/ጽ/ቤታችን ግልፅ ጨረታ ቁጥር _______ በ_______ ዓ.ም የተካሄደ መሆኑ ይታወቃል። 
በዚህ መሠረት ስት _____________ በኮድ-_______ የተለየዩ _____________ 
በብር _____________ ተወዳድረው አሸናፊ መሆናቸውን እየገለፅን...

70% ---------------------------------------------------- _____________
30% ---------------------------------------------------- _____________
15% (ቫት) --------------------------------------------- _____________
ጠቅላላ ድምር ------------------------------------------- _____________
```

**After (with placeholders):**
```
ቁጥር/Ref.No: {refNumber}
ቀን /Date: {date}

በቅ/ጽ/ቤታችን ግልፅ ጨረታ ቁጥር {tenderNumber} በ{date} ዓ.ም የተካሄደ መሆኑ ይታወቃል። 
በዚህ መሠረት ስት {winnerName} በኮድ-{groupCode} የተለየዩ {itemDescription} 
በብር {winnerPrice} ተወዳድረው አሸናፊ መሆናቸውን እየገለፅን...

70% ---------------------------------------------------- {calc70}
30% ---------------------------------------------------- {calc30}
15% (ቫት) --------------------------------------------- {vat}
ጠቅላላ ድምር ------------------------------------------- {totalWithVAT}
```

**Downloaded result:**
```
ቁጥር/Ref.No: 033/2018/CODE-10
ቀን /Date: 25/08/2017

በቅ/ጽ/ቤታችን ግልፅ ጨረታ ቁጥር 033/2018 በ25/08/2017 ዓ.ም የተካሄደ መሆኑ ይታወቃል። 
በዚህ መሠረት ስት አቶ አብዱላሂ መሀመድ በኮድ-CODE-10 የተለየዩ የሞባይል ቀፎ 
በብር 1,234,567.89 ተወዳድረው አሸናፊ መሆናቸውን እየገለፅን...

70% ---------------------------------------------------- 864,197.52
30% ---------------------------------------------------- 370,370.37
15% (ቫት) --------------------------------------------- 185,185.18
ጠቅላላ ድምር ------------------------------------------- 1,419,753.07
```

## ⚠️ Important Rules

1. **Keep the curly braces**: `{winnerName}` ✅ not `winnerName` ❌
2. **Exact spelling**: `{winnerName}` ✅ not `{WinnerName}` ❌
3. **No spaces**: `{winnerName}` ✅ not `{ winnerName }` ❌
4. **Keep your background**: Don't delete any images, logos, or formatting
5. **Save the file**: After adding placeholders

## 🚀 How It Works

```
1. You click "Winner Letter" button
   ↓
2. System finds የመሸኛ ደብደዳቤ winnerformat.docx
   ↓
3. System loads your background and formatting
   ↓
4. System replaces {winnerName} with actual name
   System replaces {winnerPrice} with actual price
   System replaces all other placeholders
   ↓
5. You download the document WITH YOUR BACKGROUND ✅
```

## 📍 File Location

Make sure your file is here:
```
c:\Users\Oumer\Desktop\auction\የመሸኛ ደብደዳቤ winnerformat.docx
```

## ✅ That's It!

Just:
1. Open the Word file
2. Replace text with placeholders (like `{winnerName}`)
3. Save
4. Test by downloading a winner letter

**Your background will automatically be included!**
