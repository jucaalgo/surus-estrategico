const fs = require('fs');
const http = require('http');
const https = require('https');

const filesToCheck = [
    'public/index.html',
    'public/dashboard/index.html',
    'public/dashboard/intel-data.js',
    'public/dashboard/app.js'
];

let allUrls = new Set();
const urlRegex = /(?:https?|ftp):\/\/[^\s"'<>)]+/gi;

filesToCheck.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        let match;
        while ((match = urlRegex.exec(content)) !== null) {
            let url = match[0];
            // Remove any trailing commas or punctuation
            url = url.replace(/[,;]$/, '');
            if (url.startsWith('http')) {
                allUrls.add(url);
            }
        }
    } catch (e) {
        console.error('Error reading', file, e.message);
    }
});

console.log('Found ' + allUrls.size + ' unique URLs to check.');
let checked = 0;
let broken = [];
let valid = 0;

function checkUrl(url) {
    return new Promise((resolve) => {
        const client = url.startsWith('https') ? https : http;
        const options = {
            method: 'HEAD',
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        };
        const req = client.request(url, options, (res) => {
            // some servers reject HEAD, so 405 is fine too, or we can just accept any status for now, wait we need < 400 or 403 (some protect) or 405
            if (res.statusCode >= 200 && res.statusCode < 400 || res.statusCode === 403 || res.statusCode === 405) {
                resolve({url, ok: true, status: res.statusCode});
            } else {
                resolve({url, ok: false, status: res.statusCode});
            }
        });
        req.on('error', (e) => {
            resolve({url, ok: false, status: e.message});
        });
        req.on('timeout', () => {
            req.abort();
            resolve({url, ok: false, status: 'timeout'});
        });
        req.end();
    });
}

async function run() {
    let urls = Array.from(allUrls);
    for (let i = 0; i < urls.length; i++) {
        let res = await checkUrl(urls[i]);
        checked++;
        if (!res.ok) {
            // double check with GET if HEAD fails
            try {
                res = await new Promise((resolve) => {
                    const client = res.url.startsWith('https') ? https : http;
                    const options = { method: 'GET', timeout: 5000, headers: {'User-Agent': 'Mozilla/5.0'} };
                    const req = client.request(res.url, options, (res2) => {
                        if (res2.statusCode >= 200 && res2.statusCode < 400 || res2.statusCode === 403 || res2.statusCode === 405) {
                            resolve({url: res.url, ok: true, status: res2.statusCode});
                        } else {
                            resolve({url: res.url, ok: false, status: res2.statusCode});
                        }
                    });
                    req.on('error', (e) => resolve({url: res.url, ok: false, status: e.message}));
                    req.on('timeout', () => { req.abort(); resolve({url: res.url, ok: false, status: 'timeout'}); });
                    req.end();
                });
            } catch (e) {}
        }
        
        if (!res.ok) {
            broken.push(res);
            console.log('BROKEN:', res.url, '->', res.status);
        } else {
            valid++;
        }
        if (checked % 10 === 0) console.log('Checked ' + checked + '/' + urls.length);
    }
    console.log('DONE. Total broken: ' + broken.length + ', Total valid: ' + valid);
    fs.writeFileSync('broken-links-report2.json', JSON.stringify(broken, null, 2));
}

run();
