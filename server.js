const express = require('express');
const https = require('https');
const app = express();
const path = require('path');

app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

/**
 * קורא ל־API של RapidAPI ומחזיר קואורדינטות ITM.
 * @param {number} lat קו רוחב
 * @param {number} lon קו אורך
 * @returns {Promise<Object>} אובייקט התגובה מה־API
 */
function callRapidApi(lat, lon) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'wgs84-to-itm.p.rapidapi.com',
      path: `/convert-to-itm?lat=${lat}&long=${lon}`,
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'wgs84-to-itm.p.rapidapi.com',
        'x-rapidapi-key': '59400d805cmshe8071a6bb086923p1fe4b4jsn9003b47efcf8'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

app.post('/convert', async (req, res) => {
  try {
    const input = req.body.url || '';
    // חילוץ קווי רוחב ואורך מהקישור
    const match =
      input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
      input.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (!match) {
      return res.status(400).json({ error: 'לא נמצאו קואורדינטות תקינות' });
    }
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);

    // קריאה ל־RapidAPI לקבלת ITM
    const result = await callRapidApi(lat, lon);

    // שליפת שני המספרים הראשונים מהתגובה (X, Y)
    const values = Object.values(result).filter((val) => typeof val === 'number');
    const itmX = values[0];
    const itmY = values[1];

    return res.json({
      lat,
      lon,
      itmX,
      itmY,
      govmap: `https://www.govmap.gov.il/?c=${itmX},${itmY}&z=10`
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'שגיאה פנימית או קריאה ל־API נכשלה' });
  }
});

// שורש האתר מגיש את index.html
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
