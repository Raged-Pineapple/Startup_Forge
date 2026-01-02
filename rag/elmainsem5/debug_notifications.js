const fetch = require('node-fetch');

// Adjust the senderId to the one you are testing as (User 1)
const senderId = '1';

async function checkNotifications() {
    console.log(`Checking notifications for Sender ID: ${senderId}`);
    try {
        const response = await fetch('http://localhost:3000/connections/notifications', {
            headers: { 'x-user-id': senderId }
        });

        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error('Response:', text);
            return;
        }

        const data = await response.json();
        console.log('Notifications found:', data.length);
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Fetch failed:', e);
    }
}

checkNotifications();
