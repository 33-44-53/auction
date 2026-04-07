# Yasbella Letter System - Implementation Complete

## Overview
The system now supports two types of yasbella (forfeiture) letters based on the reason for cancellation:

### 1. NO_PAYMENT (Didn't Pay in Given Time)
Winner failed to pay within the specified deadline (typically 5 days).

**Letter Content:**
```
በግልፅ ጨረታ ቁጥር [TENDER_NUMBER] በቀን [DATE] ዓ.ም በተካሄደ ጨረታ [WINNER_NAME] የተባሉት ተጫራች 
በኮድ-[GROUP_CODE] [ITEMS_DESCRIPTION] በብር [WINNER_PRICE] ያሸነፉ ሲሆን ነገር ግን ያሸነፉትን እቃዎች 
በተቀመጠላቸው የጊዜ ገደብ ውስጥ ክፍያውን ከፍለው ለመውሰድ ፈቃደኛ ባለመሆናቸው ለጨረታ ያስያዙት 5% 
ለመንግስት ገቢ እንዲሆን እናሳውቃለን፡፡
```

### 2. REFUSED_TO_PAY (Written Cancellation / Refused to Pay)
Winner submitted written cancellation request or explicitly refused to pay.

**Letter Content:**
```
በግልፅ ጨረታ ቁጥር [TENDER_NUMBER] በቀን [DATE] ዓ.ም በተካሄደ ጨረታ [WINNER_NAME] የተባሉት ተጫራች 
በኮድ-[GROUP_CODE] [ITEMS_DESCRIPTION] በብር [WINNER_PRICE] ያሸነፉ ሲሆን ነገር ግን ያሸነፉትን እቃ 
ክፍያውን ከፍለው እንደማይረከቡ በቀን [REFUSAL_DATE] በፃፉት ማመልከቻ ያሳወቁን ስለሆነ ለጨረታ ያስያዙት 5% 
ለመንግስት ገቢ እንዲሆን እናሳውቃለን፡፡
```

## API Endpoints

### 1. Generate Yasbella Letter (JSON)
**POST** `/api/yasbella/generate`

**Request Body:**
```json
{
  "groupId": 123,
  "reason": "NO_PAYMENT" // or "REFUSED_TO_PAY"
}
```

**Response:**
```json
{
  "letterContent": "...",
  "penalty": 218750.00,
  "reason": "NO_PAYMENT",
  "winnerName": "አቶ ሀይሌ ገ/ኪዳን"
}
```

### 2. Download Yasbella Letter (DOCX)
**GET** `/api/export/yasbela-letter/:groupId`

Downloads a formatted Word document with the yasbella letter.

### 3. Apply Yasbella to Group
**POST** `/api/groups/:id/yasbela`

**Request Body:**
```json
{
  "yasbelaType": "NO_PAYMENT",
  "reason": "Optional additional details",
  "yasbelaTenderId": 456,
  "newGroupCode": "ኮድ-21A"
}
```

## Frontend Usage

### Step 1: Close Group and Select Winner
1. Navigate to group detail page
2. Click "Close Group" button
3. System automatically selects highest bidder as winner

### Step 2: Apply Yasbella
1. Click "Apply Yasbella" button (visible when group status is SOLD)
2. Select yasbella type:
   - **Didn't Pay in Given Time** - for deadline violations
   - **Refused to Pay / Written Cancellation** - for explicit refusals
3. Optionally add cancellation reason
4. Select target tender or create new one
5. Click "Apply Yasbella"

### Step 3: Download Yasbella Letter
1. After yasbella is applied, group status changes to "YASBELA"
2. Click "Yasbela Letter" button to download the formatted Word document
3. Letter includes:
   - Tender and group information
   - Winner details
   - 5% penalty calculation (in numbers and Amharic words)
   - Account number for payment (1000014311762)
   - Distribution list

## Database Schema Updates

The `Group` model now includes:
- `yasbelaType`: String - "NO_PAYMENT" or "REFUSED_TO_PAY"
- `yasbelaPenalty`: Float - 5% of winner price
- `yasbelaReason`: String - Optional additional details
- `yasbelaDate`: DateTime - Date when yasbella was applied

## Features

✅ Two distinct yasbella letter templates
✅ Automatic 5% penalty calculation
✅ Amharic number-to-words conversion
✅ Word document export with proper formatting
✅ Group re-auction in new or existing tender
✅ Audit logging for all yasbella actions
✅ UI with radio button selection for yasbella type

## Testing

To test the yasbella system:

1. Create a tender with groups
2. Add bidders and submit bids
3. Close a group (selects winner)
4. Apply yasbella with either type
5. Download the yasbella letter
6. Verify the letter content matches the selected type

## Example Penalty Calculation

Winner Price: 4,375,000.00 Birr
Penalty (5%): 218,750.00 Birr
In Amharic: ሁለት መቶ አስራ ስምንት ሰባት መቶ ሃምሳ ብር

## Files Modified

1. `/src/routes/yasbella.js` - New yasbella letter generation API
2. `/src/routes/group.js` - Updated yasbela endpoint to store yasbelaType
3. `/src/routes/export.js` - Added yasbela-letter export endpoint
4. `/src/server.js` - Registered yasbella routes
5. `/frontend/src/App.jsx` - UI already supports yasbelaType selection

## Next Steps

The system is now ready for production use. Users can:
- Apply yasbella with appropriate reason
- Generate official letters for accounting department
- Track all yasbella actions in audit logs
- Re-auction forfeited items in new tenders
