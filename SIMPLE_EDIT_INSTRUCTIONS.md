# Simple Instructions: Edit Your Winner Letter Template

## Your File Has Content!

The file `የመሸኛ_ደብደዳቤ_WITH_PLACEHOLDERS.docx` is **202 KB** - it's a copy of your original document with the background.

## How to Edit It

### Step 1: Open the File
1. Go to: `c:\Users\Oumer\Desktop\auction\`
2. Double-click: `የመሸኛ_ደብደዳቤ_WITH_PLACEHOLDERS.docx`
3. It will open in Microsoft Word

### Step 2: You'll See Your Content
Your document already has:
- ✅ Background
- ✅ Logos
- ✅ Formatting
- ✅ Text content

### Step 3: Add Placeholders

**Find the text that should be dynamic and replace it:**

#### Example 1: Reference Number
If your document says:
```
ቁጥር/Ref.No: 033/2018/CODE-10
```

Change it to:
```
ቁጥር/Ref.No: {refNumber}
```

#### Example 2: Date
If your document says:
```
ቀን /Date: 25/08/2017
```

Change it to:
```
ቀን /Date: {date}
```

#### Example 3: Winner Name
If your document says:
```
ስት አቶ አብዱላሂ መሀመድ
```

Change it to:
```
ስት {winnerName}
```

#### Example 4: Price
If your document says:
```
በብር 1,234,567.89
```

Change it to:
```
በብር {winnerPrice}
```

### Step 4: All Placeholders

Replace these parts of your document:

| What to Find | Replace With |
|--------------|--------------|
| Reference number (e.g., 033/2018/CODE-10) | `{refNumber}` |
| Date (e.g., 25/08/2017) | `{date}` |
| Tender number in text | `{tenderNumber}` |
| Winner's name | `{winnerName}` |
| Group code (e.g., CODE-10) | `{groupCode}` |
| Item description | `{itemDescription}` |
| Winning price amount | `{winnerPrice}` |
| 70% amount | `{calc70}` |
| 30% amount | `{calc30}` |
| VAT amount | `{vat}` |
| Total amount | `{totalWithVAT}` |

### Step 5: Save

1. Click **File → Save**
2. Close Word

### Step 6: Rename the File

Run these commands in Command Prompt:

```cmd
cd c:\Users\Oumer\Desktop\auction
del "የመሸኛ ደብደዳቤ winnerformat.docx"
ren "የመሸኛ_ደብደዳቤ_WITH_PLACEHOLDERS.docx" "የመሸኛ ደብደዳቤ winnerformat.docx"
```

Or manually:
1. Delete the old `የመሸኛ ደብደዳቤ winnerformat.docx`
2. Rename `የመሸኛ_ደብደዳቤ_WITH_PLACEHOLDERS.docx` to `የመሸኛ ደብደዳቤ winnerformat.docx`

## ✅ Done!

Now when you download a winner letter:
- Your background will be there
- Data will be filled in automatically

## Need Help?

If you can't see the content:
1. Make sure you're opening the file in Microsoft Word (not Notepad)
2. The file is 202 KB, so it definitely has content
3. Try opening the original file first: `የመሸኛ ደብደዳቤ winnerformat.docx`

## Quick Test

After editing:
1. Go to your system
2. Find a SOLD group
3. Click "Winner Letter"
4. Download and check if background and data are both there
