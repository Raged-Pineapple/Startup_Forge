const https = require('https');

const data = JSON.stringify({
    query: "ai",
    top_k: 5
});

const options = {
    hostname: 'startupforge-rag.onrender.com',
    port: 443,
    path: '/search/founders',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log(`Testing RAG Endpoint: https://${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let responseBody = '';

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:');
        try {
            const parsed = JSON.parse(responseBody);
            console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log(responseBody);
        }
    });
});

req.on('error', (error) => {
    console.error(`ERROR: ${error.message}`);
});

req.write(data);
req.end();
