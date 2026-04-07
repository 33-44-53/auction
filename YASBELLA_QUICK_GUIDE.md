# Yasbella Letter Quick Reference

## Two Types of Yasbella

### Type 1: NO_PAYMENT (ክፍያውን ከፍለው ለመውሰድ ፈቃደኛ ባለመሆናቸው)
**When to use:** Winner didn't pay within the given time (5 days deadline)

**Key phrase in letter:**
> "ያሸነፉትን እቃዎች በተቀመጠላቸው የጊዜ ገደብ ውስጥ ክፍያውን ከፍለው ለመውሰድ ፈቃደኛ ባለመሆናቸው"

**Signature line:** መ/ድ

---

### Type 2: REFUSED_TO_PAY (ክፍያውን ከፍለው እንደማይረከቡ በፃፉት ማመልከቻ)
**When to use:** Winner submitted written cancellation or refused to pay

**Key phrase in letter:**
> "ያሸነፉትን እቃ ክፍያውን ከፍለው እንደማይረከቡ በቀን [DATE] በፃፉት ማመልከቻ ያሳወቁን ስለሆነ"

**Signature line:** በ/መ

---

## How to Use in System

1. **Close Group** → Winner selected automatically
2. **Click "Apply Yasbella"** button
3. **Select Type:**
   - ☐ Didn't Pay in Given Time (NO_PAYMENT)
   - ☐ Refused to Pay / Written Cancellation (REFUSED_TO_PAY)
4. **Add optional reason** (additional details)
5. **Select target tender** (or create new)
6. **Submit** → Group moves to YASBELA status
7. **Download Letter** → Click "Yasbela Letter" button

---

## Letter Components

Both letters include:
- ✅ Tender number and date
- ✅ Winner name
- ✅ Group code
- ✅ Items description
- ✅ Winner price
- ✅ 5% penalty (in numbers and Amharic words)
- ✅ Account number: 1000014311762
- ✅ Distribution list (ግልባጭ)

---

## API Endpoints

```
POST /api/yasbella/generate
GET  /api/export/yasbela-letter/:groupId
POST /api/groups/:id/yasbela
```

---

## Example

**Scenario:** አቶ ሀይሌ ገ/ኪዳን won ኮድ-21 for 4,375,000.00 Birr but didn't pay

**Action:** Apply Yasbella → Type: NO_PAYMENT

**Result:**
- Penalty: 218,750.00 Birr (ሁለት መቶ አስራ ስምንት ሰባት መቶ ሃምሳ ብር)
- Letter generated with NO_PAYMENT template
- Group moved to new tender for re-auction
- Winner notified via official letter
