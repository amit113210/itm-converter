);
const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

function LatLng2ITM(lat, lon) {
  const deg2rad = Math.PI / 180;
  const a = 6378137;
  const f = 1 / 298.257222101;
  const b = a * (1 - f);
  const lon0 = 35.20451694444 * deg2rad;
  const k0 = 1.0000067;
  const FE = 219529.584;
  const FN = 626907.39;

  lat *= deg2rad;
  lon *= deg2rad;

  const n = (a - b) / (a + b);
  const A = a / (1 + n) * (1 + n * n / 4 + n ** 4 / 64);

  const t = Math.sinh(Math.atanh(Math.sin(lat)) - (2 * Math.sqrt(n)) / (1 + n) *
    Math.atanh((2 * Math.sqrt(n)) / (1 + n) * Math.sin(lat)));

  const xi = Math.atan(t / Math.cos(lon - lon0));
  const eta = Math.atanh(Math.sin(lon - lon0) / Math.sqrt(1 + t * t));

  const x = k0 * A * xi + FN;
  const y = k0 * A * eta + FE;

  return { x: Math.round(y), y: Math.round(x) };
}

app.get('/convert', (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'Missing or invalid lat/lng' });
  }

  const result = LatLng2ITM(lat, lng);
  res.json(result);
});

app.get('/', (req, res) => {
  res.send("ITM converter API by Amit 🚀");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
