const fs = require('fs');
const https = require('https');
const http = require('http');

// Simple script to read intel-data.js and extract URLs, then check them.

const filePath = './public/dashboard/intel-data.js';

let data = fs.readFileSync(filePath, 'utf8');

// A crude way to extract URLs from the file using regex
const urlRegex = /url:\s*"(https?:\/\/[^"]+)"/g;

let match;
const urls = new Set();
while ((match = urlRegex.exec(data)) !== null) {
  urls.add(match[1]);
}

console.log(`Found ${urls.size} unique URLs to check.`);

const checkUrl = (url) => {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ url, status: err.message });
    });
    
    // timeout
    req.setTimeout(10000, () => {
      req.abort();
      resolve({ url, status: 'TIMEOUT' });
    });
  });
};

const run = async () => {
  for (const url of urls) {
    // Some are unsplash images, let's check them too, though usually they are fine
    const result = await checkUrl(url);
    if (result.status !== 200) {
      console.log(`[WARNING] ${result.status} - ${result.url}`);
    } else {
      console.log(`[OK] 200 - ${result.url}`);
    }
  }
};

run();
