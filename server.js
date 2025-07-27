const express = require('express');
const app = express();
const path = require('path');
const proj4 = require('./proj4');

app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

// הגדרת מערכת ITM לפי EPSG:2039
proj4.defs('EPSG:2039',
  "+proj=tmerc +lat_0=31.7343936111111 +lon_0=35.2045169444444 " +
  "+k=1.0000067 +x_0=219529.584 +y_0=626907.39 +ellps=GRS80 " +
  "+towgs84=23.772,17.49,17.859,-0.3132,-1.85274,1.67299,-5.4262 " +
  "+units=m +no_defs"
);

function latlon_to_itm(lat, lon) {
  const [x, y] = proj4('WGS84', 'EPSG:2039', [lon, lat]);
  return { x: Math.round(x), y: Math.round(y) };
}

app.post('/convert', (req, res) => {
  try {
    const input = req.body.url || '';
    const match =
      input.match(/@(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)/) ||
      input.match(/!3d(-?\\d+\\.\\d+)!4d(-?\\d+\\.\\d+)/);
    if (!match) {
      return res.status(400).json({ error: 'לא נמצאו קואורדינטות תקינות' });
    }
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    const itm = latlon_to_itm(lat, lon);
    return res.json({
      lat,
      lon,
      itmX: itm.x,
      itmY: itm.y,
      govmap: `https://www.govmap.gov.il/?c=${itm.x},${itm.y}&z=10`
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'שגיאה פנימית' });
  }
});

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
