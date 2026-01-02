const http = require('http');

function getInbox(userId) {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/inbox',
        method: 'GET',
        headers: {
            'x-user-id': String(userId),
            'x-user-role': 'founder' // dummy
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log(`User ${userId} Inbox:`, data);
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request for User ${userId}: ${e.message}`);
    });

    req.end();
}

console.log('Testing Inbox for User 1 and 2...');
getInbox(1);
getInbox(2);
