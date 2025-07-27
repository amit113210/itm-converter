const express = require('express');
const cors = require('cors');
const app = express();
const axios = require('axios');

app.use(cors());
app.use(express.json());

// ברירת מחדל - עמוד סטטי למשל index.html אם יש לך
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('שרת פועל!');
});

// דוגמה לנקודת קצה להמרה בעתיד
app.post('/convert', async (req, res) => {
  const { lat, lon } = req.body;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat/lon' });
  }

  try {
    // כאן אפשר להטמיע בקשת המרה או להשתמש בספריית המרה מקומית
    res.json({ itmX: 999999, itmY: 888888 });
  } catch (e) {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
