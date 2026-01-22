const express = require('express');
const Gun = require('gun');
require('gun/sea');

const app = express();
app.use(require('cors')());
app.get('/', (req, res) => res.send('OK'));

const port = process.env.PORT || 8765;
const server = app.listen(port, () => {
  console.log(`Gun server running on port ${port}`);
});

process.on('uncaughtException', (err) => {
  console.error('Gun Uncaught Exception:', err);
});


Gun({ web: server });
