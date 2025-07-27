const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { convertLatLonToITM } = require('./convert');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('שרת פועל');
});

app.post('/convert', async (req, res) => {
  const { lat, lon } = req.body;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat/lon' });
  }

  try {
    const { x, y } = convertLatLonToITM(lat, lon);
    res.json({ itmX: x, itmY: y });
  } catch (e) {
    res.status(500).json({ error: 'שגיאה בהמרה' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
