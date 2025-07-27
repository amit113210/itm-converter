const express = require('express');
const https = require('https');
const app = express();
const path = require('path');

app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

/**
 * קריאה ל־RapidAPI להמרה מ-WGS84 ל-ITM.
 * @param {number} lat קו רוחב
 * @param {number} lon קו אורך
 * @returns {Promise<Object>} אובייקט JSON עם התוצאה מה-API
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
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

app.post('/convert', async (req, res) => {
  try {
    const input = req.body.url || '';
    // חילוץ lat/lon מהקישור (מזהה @32.768,.. או !3d.. !4d..)
    const match =
      input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
      input.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (!match) {
      return res.status(400).json({ error: 'לא נמצאו קואורדינטות תקינות' });
    }

    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);

// ... (אותו קוד קודם עד לפונקציית ה-callRapidApi)

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
    console.log('תשובה מה-API:', result); // הדפסת תוכן מלא

    // כאן תוכל לעדכן לפי השמות המדויקים בתשובה
    const itmX = Number(result.itmX || result.x || result.easting);
    const itmY = Number(result.itmY || result.y || result.northing);

    return res.json({
      lat,
      lon,
      itmX,
      itmY,
      govmap: `https://www.govmap.gov.il/?c=${itmX},${itmY}&z=10`
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'שגיאה פנימית או תקלה בקריאה ל-API' });
  }
});


// הגשת index.html בנתיב הראשי
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
