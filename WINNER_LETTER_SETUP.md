# Winner Letter Template Setup Guide

## Current Status
✅ The system is already configured to use `የመሸኛ ደብደዳቤ winnerformat.docx` as the template
✅ The template file exists in the project root directory
✅ The background and formatting will be preserved automatically

## How It Works

When you download a winner letter, the system:
1. **Checks** if `የመሸኛ ደብደዳቤ winnerformat.docx` exists
2. **Loads** the template with its background and formatting
3. **Replaces** placeholders with actual data
4. **Generates** the final document with the background intact

## Step-by-Step: Add Placeholders to Your Template

### 1. Open the Template
- Open `የመሸኛ ደብደዳቤ winnerformat.docx` in Microsoft Word
- Your background, logos, and formatting are already there

### 2. Add Placeholders

Replace the actual content with these placeholders (keep the curly braces `{}`):

#### Header Section
```
ቁጥር/Ref.No: {refNumber}
ቀን /Date: {date}
```

#### Body Section
```
ለገቢ አሰባሰብና ዋስትና አያያዝ ቡድን

ጉዳዩ፤ ክፊያ መቀበለን ይመለከታል

በቅ/ጽ/ቤታችን ግልፅ ጨረታ ቁጥር {tenderNumber} በ{date} ዓ.ም የተካሄደ መሆኑ ይታወቃል። 
በዚህ መሠረት ስት {winnerName} በኮድ-{groupCode} የተለየዩ {itemDescription} 
በብር {winnerPrice} ተወዳድረው አሸናፊ መሆናቸውን እየገለፅን የክፍያ ሁኔታው ከዚህ በታች እንደሚከተለው ቀርቧል።

70% ---------------------------------------------------- {calc70}
30% ---------------------------------------------------- {calc30}
15% (ቫት) --------------------------------------------- {vat}
ጠቅላላ ድምር ------------------------------------------- {totalWithVAT}

[Rest of your letter content...]
```

### 3. Available Placeholders

| Placeholder | Description | Example Output |
|------------|-------------|----------------|
| `{refNumber}` | Reference number | 033/2018/CODE-10 |
| `{date}` | Ethiopian date | 25/08/2017 |
| `{tenderNumber}` | Tender number | 033/2018 |
| `{winnerName}` | Winner's name | አቶ አብዱላሂ መሀመድ |
| `{groupCode}` | Group code | CODE-10 |
| `{itemDescription}` | Item description | የሞባይል ቀፎ |
| `{winnerPrice}` | Winning price (formatted) | 1,234,567.89 |
| `{calc70}` | 70% of price (formatted) | 864,197.52 |
| `{calc30}` | 30% of price (formatted) | 370,370.37 |
| `{vat}` | 15% VAT (formatted) | 185,185.18 |
| `{totalWithVAT}` | Total with VAT (formatted) | 1,419,753.07 |

### 4. Example Template Content

Here's how your template should look with placeholders:

```
[Your letterhead/logo/background here]

ቁጥር/Ref.No: {refNumber}
ቀን /Date: {date}

ለገቢ አሰባሰብና ዋስትና አያያዝ ቡድን

ጉዳዩ፤ ክፊያ መቀበለን ይመለከታል

በቅ/ጽ/ቤታችን ግልፅ ጨረታ ቁጥር {tenderNumber} በ{date} ዓ.ም የተካሄደ መሆኑ ይታወቃል። 
በዚህ መሠረት ስት {winnerName} በኮድ-{groupCode} የተለየዩ {itemDescription} 
በብር {winnerPrice} ተወዳድረው አሸናፊ መሆናቸውን እየገለፅን የክፍያ ሁኔታው ከዚህ በታች እንደሚከተለው ቀርቧል።

70% ---------------------------------------------------- {calc70}
30% ---------------------------------------------------- {calc30}
15% (ቫት) --------------------------------------------- {vat}
ጠቅላላ ድምር ------------------------------------------- {totalWithVAT}

ስለሆነም ተጫራቹ ገንዘቡን በድሬዳዋ ጉምሩክ ኮሚሽን ቅ/ጽ/ቤት ስም በተከፈተው 70% በቀጥታ ገቢ አካውት ቁጥር 
1000014311762 በጉምርክ ኮሚሽን እና ለፍትህ ሚንስቴር 30%ቱን እና ቫቱን በዲፖዚት አካውንት 1000014260092 
ሪሲት አሰርተው ሲያቀርቡ ተቆርጦ እንዲሰጣቸው እያሳሰብን የውርስ እቃ መጋዘን ሀላፊ የክፍያውን መረጃ ይዘው ሲቀርቡ 
ከዚህ ደብዳቤ ጋር ተያይዞ በቀረበው ዝርዝር መሰረት በሞዴል 266 ወጪ በማድረግ ንብረቱን እንድታስረክቡ እያሳሰብን 
ለርክክብ ይረዳ ዘንድ የእቃው ዝርዝር 1 ገጽ ከዚህ ደብዳቤ ጋር ያያዝን ሲሆን የእቃ አያያዝ ቡድንም ያሸነፉትን እቃ 
ክፍያ መፈፀሙን በማረጋገጥ በ 5 የስራ ቀናት ውስጥ ከመጋዘን እናዲያወጡ ለርክክብ ይረዳ ዘንድ ግልባጭ ተደርጎለታል፡፡

‹‹ከሰላምታ ጋር››

ግልባጭ፡-
ለጉምሩክ ኦፕሬሽን ም/ስ/አስኪያጅ
የተያዙና የተወረሱ ንብ/አስ/የስራ ሂደት
ለኢንተለጀንስ እና ኮተረበንድ ክትትል የስራ ሂደት
ለእቃ አያያዝ ቡድን
ለውርስ እቃ አስወጋጅ ኮሚቴ
መጋዘን 1
ለበር ጥበቃ
ለድ/ለኮን/ቁጥ/ድን/ተሻ/ፖሊ/መምሪያ ሪጅመንት 14
ድ/ዳ/ጉ/ኮምሽን
አቶ {winnerName}
በ/መ

[Your footer/signature area here]
```

### 5. Important Tips

✅ **DO:**
- Keep your background images/watermarks
- Keep your letterhead and logos
- Keep your formatting (fonts, colors, spacing)
- Use placeholders exactly as shown (case-sensitive)
- Save the file after adding placeholders

❌ **DON'T:**
- Remove the background
- Change the file name
- Use different placeholder names
- Remove the curly braces `{}`

### 6. Save the Template

1. After adding placeholders, click **File → Save**
2. Keep the filename: `የመሸኛ ደብደዳቤ winnerformat.docx`
3. Keep it in the project root directory

## Testing the Template

### 1. Create a Test Winner
1. Go to a SOLD group in your system
2. Click "📄 Winner Letter" button
3. Download the generated document

### 2. Check the Result
The downloaded document should have:
- ✅ Your background and formatting
- ✅ All placeholders replaced with actual data
- ✅ Proper calculations (70%, 30%, VAT)
- ✅ Winner's name and details

## Troubleshooting

### Problem: Placeholders not replaced
**Solution**: Make sure placeholders are exactly as shown:
- Correct: `{winnerName}`
- Wrong: `{ winnerName }` (extra spaces)
- Wrong: `{WinnerName}` (wrong case)
- Wrong: `{{winnerName}}` (double braces)

### Problem: Background not showing
**Solution**: The background should be preserved automatically. If not:
1. Check that the template file exists in the root directory
2. Make sure the file is not corrupted
3. Try re-saving the template in Word

### Problem: Template not found
**Solution**: The system will fall back to creating a letter from scratch. Make sure:
1. File is named exactly: `የመሸኛ ደብደዳቤ winnerformat.docx`
2. File is in the project root: `c:\Users\Oumer\Desktop\auction\`
3. File is not open in Word when downloading

## Current System Configuration

The system is already configured to:
1. ✅ Look for the template file
2. ✅ Load it with background preserved
3. ✅ Replace placeholders with data
4. ✅ Fall back to scratch if template not found

## Next Steps

1. **Open** `የመሸኛ ደብደዳቤ winnerformat.docx` in Word
2. **Add** placeholders where you want dynamic data
3. **Save** the file
4. **Test** by downloading a winner letter from a SOLD group
5. **Verify** that background and data are both present

## Example Workflow

```
User clicks "Winner Letter" 
    ↓
System checks for template file
    ↓
Template found ✅
    ↓
Load template (background preserved)
    ↓
Replace {winnerName} → "አቶ አብዱላሂ መሀመድ"
Replace {winnerPrice} → "1,234,567.89"
Replace {calc70} → "864,197.52"
... (all placeholders)
    ↓
Generate final document
    ↓
User downloads with background ✅
```

## Support

If you need help:
1. Check that placeholders are correct
2. Verify file location and name
3. Test with a simple placeholder first
4. Check the console for any errors

The template system is ready to use! Just add the placeholders to your document and test it.
