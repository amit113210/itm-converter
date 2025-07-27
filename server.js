
const express = require('express');
const app = express();
const path = require('path');

app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

const DEG2RAD = Math.PI / 180;

function latlon_to_itm(lat, lon) {
    // Parameters from Zvika Bahat's SQL
    const a = 6378137.0;
    const b = 6356752.314245;
    const f = (a - b) / a;
    const e2 = f * (2 - f);
    const ep2 = e2 / (1 - e2);

    const lon0 = 35.2045169444444 * DEG2RAD; // central meridian
    const k0 = 1.0000067;
    const FE = 219529.584;
    const FN = 626907.39;

    const latRad = lat * DEG2RAD;
    const lonRad = lon * DEG2RAD;

    const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) ** 2);
    const T = Math.tan(latRad) ** 2;
    const C = ep2 * Math.cos(latRad) ** 2;
    const A = (lonRad - lon0) * Math.cos(latRad);

    const M = a * (
        (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256) * latRad
        - (3 * e2 / 8 + 3 * e2 ** 2 / 32 + 45 * e2 ** 3 / 1024) * Math.sin(2 * latRad)
        + (15 * e2 ** 2 / 256 + 45 * e2 ** 3 / 1024) * Math.sin(4 * latRad)
        - (35 * e2 ** 3 / 3072) * Math.sin(6 * latRad)
    );

    const x = FE + k0 * N * (
        A + (1 - T + C) * A ** 3 / 6
        + (5 - 18 * T + T ** 2 + 72 * C - 58 * ep2) * A ** 5 / 120
    );

    const y = FN + k0 * (
        M + N * Math.tan(latRad) * (
            A ** 2 / 2 + (5 - T + 9 * C + 4 * C ** 2) * A ** 4 / 24
            + (61 - 58 * T + T ** 2 + 600 * C - 330 * ep2) * A ** 6 / 720
        )
    );

    return { x: Math.round(x), y: Math.round(y) };
}

app.post('/convert', (req, res) => {
    try {
        const input = req.body.url || '';
        const match = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || input.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);

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
