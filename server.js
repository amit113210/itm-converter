const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

async function callRapidApi(lat, lon) {
  const options = {
    method: 'GET',
    url: 'https://wgs84-to-itm.p.rapidapi.com/convert-to-itm',
    params: { lat: lat.toString(), long: lon.toString() },
    headers: {
      'x-rapidapi-host': 'wgs84-to-itm.p.rapidapi.com',
      'x-rapidapi-key': '59400d805cmshe8071a6bb086923p1fe4b4jsn9003b47efcf8'
    }
  };

  const response = await axios.request(options);
  return response.data;
}

app.post('/convert', async (req, res) => {
  try {
    const input = req.body.url || '';
    const match =
      input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
      input.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);

    if (!match) {
      return res.status(400).json({ error: 'לא נמצאו קואורדינטות תקינות' });
    }

    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);

    const result = await callRapidApi(lat, lon);
    console.log('תשובה מה-API:', result);

    // ניתוח ערכים מספריים גם אם הם מחרוזות
    const numericValues = Object.values(result).filter(
      (val) => !isNaN(val) && val !== null && val !== ''
    );
    const itmX = Number(numericValues[0]);
    const itmY = Number(numericValues[1]);

    res.json({
      lat,
      lon,
      itmX,
      itmY,
      govmap: `https://www.govmap.gov.il/?c=${itmX},${itmY}&z=10`
    });
  } catch (err) {
    console.error('שגיאה:', err);
    res.status(500).json({ error: 'שגיאה בשרת' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
