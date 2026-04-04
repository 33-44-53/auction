#!/bin/bash
# Performance Optimization Test Script
# Tests compression, pagination, and response times

echo "=========================================="
echo "🧪 Testing Performance Optimizations"
echo "=========================================="
echo ""

# Configuration
API_URL="https://auction-i5wc.onrender.com"
EMAIL="admin@tender.com"
PASSWORD="admin123"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check & Compression
echo "📋 Test 1: Health Check & Compression"
echo "--------------------------------------"
HEALTH_RESPONSE=$(curl -s -I "$API_URL/api/health")
echo "$HEALTH_RESPONSE"

if echo "$HEALTH_RESPONSE" | grep -q "Content-Encoding: gzip"; then
    echo -e "${GREEN}✅ Compression: ENABLED${NC}"
else
    echo -e "${RED}❌ Compression: NOT ENABLED${NC}"
fi

if echo "$HEALTH_RESPONSE" | grep -q "200 OK"; then
    echo -e "${GREEN}✅ Server: ONLINE${NC}"
else
    echo -e "${RED}❌ Server: OFFLINE${NC}"
fi
echo ""

# Test 2: Login & Get Token
echo "📋 Test 2: Authentication"
echo "--------------------------------------"
LOGIN_START=$(date +%s%3N)
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
LOGIN_END=$(date +%s%3N)
LOGIN_TIME=$((LOGIN_END - LOGIN_START))

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Login: FAILED${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
else
    echo -e "${GREEN}✅ Login: SUCCESS${NC}"
    echo -e "${GREEN}✅ Token: ${TOKEN:0:20}...${NC}"
    echo -e "${YELLOW}⏱️  Login Time: ${LOGIN_TIME}ms${NC}"
fi
echo ""

# Test 3: Pagination Test
echo "📋 Test 3: Pagination (New Feature)"
echo "--------------------------------------"
PAGINATION_START=$(date +%s%3N)
PAGINATION_RESPONSE=$(curl -s "$API_URL/api/tenders?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN")
PAGINATION_END=$(date +%s%3N)
PAGINATION_TIME=$((PAGINATION_END - PAGINATION_START))

if echo "$PAGINATION_RESPONSE" | grep -q '"pagination"'; then
    echo -e "${GREEN}✅ Pagination: WORKING${NC}"
    echo "Response structure:"
    echo "$PAGINATION_RESPONSE" | grep -o '"pagination":{[^}]*}' | head -1
else
    echo -e "${RED}❌ Pagination: NOT WORKING (Old API format)${NC}"
    echo "Response preview: ${PAGINATION_RESPONSE:0:200}..."
fi
echo -e "${YELLOW}⏱️  Response Time: ${PAGINATION_TIME}ms${NC}"
echo ""

# Test 4: Response Size Comparison
echo "📋 Test 4: Response Size (Compression Test)"
echo "--------------------------------------"
FULL_RESPONSE=$(curl -s "$API_URL/api/tenders?page=1&limit=20&details=true" \
  -H "Authorization: Bearer $TOKEN")
RESPONSE_SIZE=${#FULL_RESPONSE}
RESPONSE_SIZE_KB=$((RESPONSE_SIZE / 1024))

echo -e "${YELLOW}📦 Response Size: ${RESPONSE_SIZE} bytes (${RESPONSE_SIZE_KB} KB)${NC}"

if [ $RESPONSE_SIZE_KB -lt 100 ]; then
    echo -e "${GREEN}✅ Size: OPTIMIZED (< 100KB)${NC}"
elif [ $RESPONSE_SIZE_KB -lt 300 ]; then
    echo -e "${YELLOW}⚠️  Size: MODERATE (100-300KB)${NC}"
else
    echo -e "${RED}❌ Size: LARGE (> 300KB) - Compression may not be working${NC}"
fi
echo ""

# Test 5: Database Query Speed (Multiple Requests)
echo "📋 Test 5: Database Performance (5 requests)"
echo "--------------------------------------"
TOTAL_TIME=0
for i in {1..5}; do
    START=$(date +%s%3N)
    curl -s "$API_URL/api/tenders?page=1&limit=10" \
      -H "Authorization: Bearer $TOKEN" > /dev/null
    END=$(date +%s%3N)
    TIME=$((END - START))
    TOTAL_TIME=$((TOTAL_TIME + TIME))
    echo "Request $i: ${TIME}ms"
done
AVG_TIME=$((TOTAL_TIME / 5))
echo "--------------------------------------"
echo -e "${YELLOW}⏱️  Average Response Time: ${AVG_TIME}ms${NC}"

if [ $AVG_TIME -lt 500 ]; then
    echo -e "${GREEN}✅ Performance: EXCELLENT (< 500ms)${NC}"
elif [ $AVG_TIME -lt 1000 ]; then
    echo -e "${YELLOW}⚠️  Performance: GOOD (500-1000ms)${NC}"
else
    echo -e "${RED}❌ Performance: SLOW (> 1000ms) - Indexes may not be applied${NC}"
fi
echo ""

# Test 6: Check Specific Tender Load Time
echo "📋 Test 6: Single Tender Load (With Relations)"
echo "--------------------------------------"
# Get first tender ID
FIRST_TENDER_ID=$(echo "$PAGINATION_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ ! -z "$FIRST_TENDER_ID" ]; then
    TENDER_START=$(date +%s%3N)
    TENDER_RESPONSE=$(curl -s "$API_URL/api/tenders/$FIRST_TENDER_ID" \
      -H "Authorization: Bearer $TOKEN")
    TENDER_END=$(date +%s%3N)
    TENDER_TIME=$((TENDER_END - TENDER_START))
    
    echo -e "${YELLOW}⏱️  Tender #$FIRST_TENDER_ID Load Time: ${TENDER_TIME}ms${NC}"
    
    if [ $TENDER_TIME -lt 300 ]; then
        echo -e "${GREEN}✅ Single Tender Load: FAST (< 300ms)${NC}"
    elif [ $TENDER_TIME -lt 1000 ]; then
        echo -e "${YELLOW}⚠️  Single Tender Load: MODERATE (300-1000ms)${NC}"
    else
        echo -e "${RED}❌ Single Tender Load: SLOW (> 1000ms)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No tenders found to test${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo "📊 OPTIMIZATION SUMMARY"
echo "=========================================="
echo ""

# Check if all optimizations are applied
COMPRESSION_OK=false
PAGINATION_OK=false
PERFORMANCE_OK=false

if echo "$HEALTH_RESPONSE" | grep -q "Content-Encoding: gzip"; then
    COMPRESSION_OK=true
fi

if echo "$PAGINATION_RESPONSE" | grep -q '"pagination"'; then
    PAGINATION_OK=true
fi

if [ $AVG_TIME -lt 1000 ]; then
    PERFORMANCE_OK=true
fi

echo "Optimization Status:"
echo "-------------------"
if [ "$COMPRESSION_OK" = true ]; then
    echo -e "${GREEN}✅ Response Compression${NC}"
else
    echo -e "${RED}❌ Response Compression${NC}"
fi

if [ "$PAGINATION_OK" = true ]; then
    echo -e "${GREEN}✅ API Pagination${NC}"
else
    echo -e "${RED}❌ API Pagination${NC}"
fi

if [ "$PERFORMANCE_OK" = true ]; then
    echo -e "${GREEN}✅ Database Indexes${NC}"
else
    echo -e "${RED}❌ Database Indexes${NC}"
fi

echo ""
echo "Performance Metrics:"
echo "-------------------"
echo "Login Time: ${LOGIN_TIME}ms"
echo "Avg Query Time: ${AVG_TIME}ms"
echo "Response Size: ${RESPONSE_SIZE_KB}KB"
echo ""

# Final verdict
if [ "$COMPRESSION_OK" = true ] && [ "$PAGINATION_OK" = true ] && [ "$PERFORMANCE_OK" = true ]; then
    echo -e "${GREEN}🎉 ALL OPTIMIZATIONS APPLIED SUCCESSFULLY!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  SOME OPTIMIZATIONS NOT YET APPLIED${NC}"
    echo ""
    echo "Next Steps:"
    if [ "$COMPRESSION_OK" = false ]; then
        echo "- Deploy backend with compression package"
    fi
    if [ "$PAGINATION_OK" = false ]; then
        echo "- Deploy backend with pagination code"
    fi
    if [ "$PERFORMANCE_OK" = false ]; then
        echo "- Apply database indexes: npx prisma db push"
    fi
    exit 1
fi
