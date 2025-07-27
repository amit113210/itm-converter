const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/convert', async (req, res) => {
  const { lat, lon } = req.body;
  if (!lat || !lon) return res.status(400).json({ error: 'Missing lat/lon' });

  try {
    const url = `https://poshmap.co.il/itmconverter_ashx?lat=${lat}&lon=${lon}`;
    const response = await axios.get(url);
    const match = response.data.match(/ITM X = (\d+)<br>ITM Y = (\d+)/);

    if (!match) throw new Error('לא נמצאו תוצאות');

    res.json({ itm_x: match[1], itm_y: match[2] });
  } catch (e) {
    res.status(500).json({ error: 'שגיאה בקבלת התוצאה' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
