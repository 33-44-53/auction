# Winner Letter Template Guide

## Overview
The system now supports using a Word document template with background for the winner letter (የመሸኛ ደብደዳቤ).

## Template File
- **Location**: `የመሸኛ ደብደዳቤ winnerformat.docx` (in the root directory)
- **Purpose**: Provides a professional background and formatting for winner letters

## How to Use Placeholders

To make the template dynamic, you need to add placeholders in the Word document. Open the template file and insert these placeholders where you want the data to appear:

### Available Placeholders

Replace the actual content in your template with these placeholders (keep the curly braces):

- `{refNumber}` - Reference number (e.g., "033/2018/CODE-10")
- `{date}` - Ethiopian date
- `{tenderNumber}` - Tender number (e.g., "033/2018")
- `{winnerName}` - Winner's name
- `{groupCode}` - Group code (e.g., "CODE-10")
- `{itemDescription}` - Description of items (e.g., "የሞባይል ቀፎ")
- `{winnerPrice}` - Winning bid price (formatted with commas)
- `{calc70}` - 70% of winning price (formatted)
- `{calc30}` - 30% of winning price (formatted)
- `{vat}` - 15% VAT amount (formatted)
- `{totalWithVAT}` - Total amount including VAT (formatted)

### Example Template Content

```
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

...rest of the letter content...
```

## How It Works

1. When a winner letter is downloaded, the system:
   - Checks if the template file exists
   - If found, loads the template and replaces all placeholders with actual data
   - If not found, creates a letter from scratch (without background)

2. The template preserves:
   - Background images/watermarks
   - Formatting and styles
   - Headers and footers
   - Page layout

## Fallback Behavior

If the template file is missing or has errors:
- The system automatically falls back to creating a letter from scratch
- The letter will have all the content but without the custom background
- No error is shown to the user

## Testing

To test the template:
1. Open `የመሸኛ ደብደዳቤ winnerformat.docx`
2. Add placeholders like `{winnerName}`, `{winnerPrice}`, etc.
3. Save the file
4. Download a winner letter from a SOLD group
5. Check if the placeholders are replaced with actual data

## Tips

- Keep the original formatting and background in the template
- Use placeholders exactly as shown (case-sensitive)
- Test with a sample group before using in production
- Keep a backup of the original template file
