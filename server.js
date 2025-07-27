const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/convert', async (req, res) => {
  const { lat, lon } = req.body;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat/lon' });
  }
 try {
    // המרה דרך שירות צד שלישי - משתמש בשרת של צביקה בהט
    const url = https://poshmap.co.il/itmconverter.ashx?lat=${lat}&lon=${lon};
    const response = await axios.get(url);
   
        const match = response.data.match(/ITM X: (\d+), ITM Y: (\d+)/);
    if (!match) throw new Error('Format mismatch');

       const itm_x = parseInt(match[1]);
    const itm_y = parseInt(match[2]);

   
   res.json({ itm_x, itm_y });
  } catch (e) {
    res.status(500).json({ error: 'שגיאה בקבלת התוצאה' });
  }
});

