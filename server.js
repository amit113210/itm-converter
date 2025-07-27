const express = require("express");
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static("public"));

// Constants for conversion (Zvika Bahat - isr84lib.sql translated)
function latLonToITM(lat, lon) {
  const deg2rad = Math.PI / 180;
  const a = 6378137.0;
  const b = 6356752.3141;
  const f = (a - b) / a;
  const e2 = 2 * f - f * f;
  const lon0 = 35.2045169444444 * deg2rad; // central meridian
  const k0 = 1.0000067;
  const falseEasting = 219529.584;
  const falseNorthing = 626907.39;

  const latRad = lat * deg2rad;
  const lonRad = lon * deg2rad;

  const n = (a - b) / (a + b);
  const A = a * (1 - n + (5 / 4) * (n ** 2 - n ** 3) + (81 / 64) * (n ** 4));
  const T = Math.tan(latRad) ** 2;
  const C = e2 * Math.cos(latRad) ** 2 / (1 - e2);
  const A1 = (lonRad - lon0) * Math.cos(latRad);

  const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) ** 2);
  const M = a * ((1 - e2 / 4 - (3 * e2 ** 2) / 64 - (5 * e2 ** 3) / 256) * latRad
    - ((3 * e2) / 8 + (3 * e2 ** 2) / 32 + (45 * e2 ** 3) / 1024) * Math.sin(2 * latRad)
    + ((15 * e2 ** 2) / 256 + (45 * e2 ** 3) / 1024) * Math.sin(4 * latRad)
    - ((35 * e2 ** 3) / 3072) * Math.sin(6 * latRad));

  const easting = falseEasting + k0 * N * (A1 + (1 - T + C) * A1 ** 3 / 6 + (5 - 18 * T + T ** 2 + 72 * C - 58 * e2) * A1 ** 5 / 120);
  const northing = falseNorthing + k0 * M + k0 * N * Math.tan(latRad) * (A1 ** 2 / 2 + (5 - T + 9 * C + 4 * C ** 2) * A1 ** 4 / 24 + (61 - 58 * T + T ** 2 + 600 * C - 330 * e2) * A1 ** 6 / 720);

  return {
    itm_x: Math.round(easting),
    itm_y: Math.round(northing)
  };
}

app.post("/convert", (req, res) => {
  const { lat, lng } = req.body;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ error: "Invalid coordinates" });
  }

  try {
    const result = latLonToITM(lat, lng);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Conversion failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
