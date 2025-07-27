const express = require("express");
const cors = require("cors");
const proj4 = require("proj4");

const app = express();
app.use(cors());
app.use(express.json()); // 👈 חובה בשביל לקבל JSON כמו שצריך

const port = process.env.PORT || 10000;

const WGS84 = "EPSG:4326";
const ITM = "+proj=tmerc +lat_0=31.7343936111111 +lon_0=35.2045169444444 +k=1.0000067 +x_0=219529.584 +y_0=626907.39 +ellps=GRS80 +units=m +no_defs";

app.post("/convert", (req, res) => {
  const { lat, lng } = req.body;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ error: "Missing or invalid lat/lng" });
  }

  try {
    const [itm_x, itm_y] = proj4(WGS84, ITM, [lng, lat]);
    res.json({ itm_x, itm_y });
  } catch (e) {
    res.status(500).json({ error: "Conversion failed" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
