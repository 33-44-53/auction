const https = require('https');
const zlib = require('zlib');

const API_URL = 'https://auction-i5wc.onrender.com';
const EMAIL = 'admin@tender.com';
const PASSWORD = 'admin123';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    // Add Accept-Encoding header by default
    if (!options.headers) options.headers = {};
    if (!options.headers['Accept-Encoding']) {
      options.headers['Accept-Encoding'] = 'gzip, deflate, br';
    }
    
    const req = https.request(url, options, (res) => {
      const endTime = Date.now();
      const encoding = res.headers['content-encoding'];
      
      let stream = res;
      
      // Decompress if needed
      if (encoding === 'gzip') {
        stream = res.pipe(zlib.createGunzip());
      } else if (encoding === 'deflate') {
        stream = res.pipe(zlib.createInflate());
      } else if (encoding === 'br') {
        stream = res.pipe(zlib.createBrotliDecompress());
      }
      
      let data = '';
      stream.on('data', (chunk) => data += chunk);
      stream.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          time: endTime - startTime
        });
      });
      stream.on('error', reject);
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('==========================================');
  console.log('🧪 Testing Performance Optimizations');
  console.log('==========================================\n');

  try {
    // Test 1: Health Check & Compression
    console.log('📋 Test 1: Health Check & Compression');
    console.log('--------------------------------------');
    const healthResponse = await makeRequest(`${API_URL}/api/health`, { 
      method: 'GET',  // Changed from HEAD to GET
      headers: { 'Accept-Encoding': 'gzip, deflate, br' }
    });
    
    console.log(`Status: ${healthResponse.statusCode}`);
    console.log(`Response Time: ${healthResponse.time}ms`);
    console.log(`Content-Encoding: ${healthResponse.headers['content-encoding'] || 'none'}`);
    
    if (healthResponse.headers['content-encoding'] === 'gzip' || healthResponse.headers['content-encoding'] === 'br') {
      console.log(`${colors.green}✅ Compression: ENABLED (${healthResponse.headers['content-encoding']})${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Compression: NOT ENABLED${colors.reset}`);
    }
    
    if (healthResponse.statusCode === 200) {
      console.log(`${colors.green}✅ Server: ONLINE${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Server: OFFLINE${colors.reset}`);
    }
    console.log('');

    // Test 2: Login
    console.log('📋 Test 2: Authentication');
    console.log('--------------------------------------');
    const loginResponse = await makeRequest(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });

    console.log(`Login Time: ${loginResponse.time}ms`);
    
    let token;
    try {
      const loginData = JSON.parse(loginResponse.data);
      token = loginData.token;
      if (token) {
        console.log(`${colors.green}✅ Login: SUCCESS${colors.reset}`);
        console.log(`${colors.green}✅ Token: ${token.substring(0, 20)}...${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ Login: FAILED${colors.reset}`);
        console.log('Response:', loginResponse.data);
        return;
      }
    } catch (e) {
      console.log(`${colors.red}❌ Login: FAILED${colors.reset}`);
      console.log('Response:', loginResponse.data);
      return;
    }
    console.log('');

    // Test 3: Pagination
    console.log('📋 Test 3: Pagination (New Feature)');
    console.log('--------------------------------------');
    const paginationResponse = await makeRequest(`${API_URL}/api/tenders?page=1&limit=5`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`Response Time: ${paginationResponse.time}ms`);
    
    try {
      const paginationData = JSON.parse(paginationResponse.data);
      if (paginationData.pagination) {
        console.log(`${colors.green}✅ Pagination: WORKING${colors.reset}`);
        console.log('Pagination Info:', JSON.stringify(paginationData.pagination, null, 2));
      } else {
        console.log(`${colors.red}❌ Pagination: NOT WORKING (Old API format)${colors.reset}`);
      }
    } catch (e) {
      console.log(`${colors.red}❌ Pagination: ERROR${colors.reset}`);
      console.log('Response:', paginationResponse.data.substring(0, 200));
    }
    console.log('');

    // Test 4: Response Size
    console.log('📋 Test 4: Response Size (Compression Test)');
    console.log('--------------------------------------');
    const fullResponse = await makeRequest(`${API_URL}/api/tenders?page=1&limit=20&details=true`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const responseSize = fullResponse.data.length;
    const responseSizeKB = (responseSize / 1024).toFixed(2);
    
    console.log(`📦 Response Size: ${responseSize} bytes (${responseSizeKB} KB)`);
    console.log(`⏱️  Response Time: ${fullResponse.time}ms`);
    
    if (responseSizeKB < 100) {
      console.log(`${colors.green}✅ Size: OPTIMIZED (< 100KB)${colors.reset}`);
    } else if (responseSizeKB < 300) {
      console.log(`${colors.yellow}⚠️  Size: MODERATE (100-300KB)${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Size: LARGE (> 300KB)${colors.reset}`);
    }
    console.log('');

    // Test 5: Performance Test (5 requests)
    console.log('📋 Test 5: Database Performance (5 requests)');
    console.log('--------------------------------------');
    const times = [];
    for (let i = 1; i <= 5; i++) {
      const response = await makeRequest(`${API_URL}/api/tenders?page=1&limit=10`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      times.push(response.time);
      console.log(`Request ${i}: ${response.time}ms`);
    }
    
    const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    console.log('--------------------------------------');
    console.log(`${colors.yellow}⏱️  Average Response Time: ${avgTime}ms${colors.reset}`);
    
    if (avgTime < 500) {
      console.log(`${colors.green}✅ Performance: EXCELLENT (< 500ms)${colors.reset}`);
    } else if (avgTime < 1000) {
      console.log(`${colors.yellow}⚠️  Performance: GOOD (500-1000ms)${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Performance: SLOW (> 1000ms)${colors.reset}`);
    }
    console.log('');

    // Summary
    console.log('==========================================');
    console.log('📊 OPTIMIZATION SUMMARY');
    console.log('==========================================\n');
    
    const compressionOK = healthResponse.headers['content-encoding'] === 'gzip' || healthResponse.headers['content-encoding'] === 'br' || healthResponse.headers['content-encoding'] === 'deflate';
    const paginationOK = paginationResponse.data.includes('"pagination"');
    const performanceOK = avgTime < 1000;
    
    console.log('Optimization Status:');
    console.log('-------------------');
    console.log(compressionOK ? `${colors.green}✅ Response Compression${colors.reset}` : `${colors.red}❌ Response Compression${colors.reset}`);
    console.log(paginationOK ? `${colors.green}✅ API Pagination${colors.reset}` : `${colors.red}❌ API Pagination${colors.reset}`);
    console.log(performanceOK ? `${colors.green}✅ Database Indexes${colors.reset}` : `${colors.red}❌ Database Indexes${colors.reset}`);
    
    console.log('\nPerformance Metrics:');
    console.log('-------------------');
    console.log(`Login Time: ${loginResponse.time}ms`);
    console.log(`Avg Query Time: ${avgTime}ms`);
    console.log(`Response Size: ${responseSizeKB}KB`);
    console.log('');
    
    if (compressionOK && paginationOK && performanceOK) {
      console.log(`${colors.green}🎉 ALL OPTIMIZATIONS APPLIED SUCCESSFULLY!${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️  SOME OPTIMIZATIONS NOT YET APPLIED${colors.reset}\n`);
      console.log('Next Steps:');
      if (!compressionOK) console.log('- Deploy backend with compression package');
      if (!paginationOK) console.log('- Deploy backend with pagination code');
      if (!performanceOK) console.log('- Apply database indexes: npx prisma db push');
    }

  } catch (error) {
    console.error(`${colors.red}❌ Error running tests:${colors.reset}`, error.message);
  }
}

// Run the tests
runTests();
