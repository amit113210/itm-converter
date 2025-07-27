
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/convert', async (req, res) => {
  const { lat, lon } = req.body;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat/lon' });
  }

  try {
    const response = await axios.get(`https://www.mapi.gov.il/GenericServices/TransformCoordinates?coordSystem=ll&X=${lon}&Y=${lat}&targetSystem=itm`);
    const { X, Y } = response.data;
    res.json({ itm_x: X, itm_y: Y });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'שגיאה בהמרת הקואורדינטות' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



