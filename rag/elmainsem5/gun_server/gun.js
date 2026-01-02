const express = require('express');
const Gun = require('gun');
require('gun/sea');

const app = express();
app.use(require('cors')());

const server = app.listen(8765, () => {
  console.log('Gun server running on port 8765');
});

process.on('uncaughtException', (err) => {
  console.error('Gun Uncaught Exception:', err);
});


Gun({ web: server });
