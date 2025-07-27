// convert.js
const proj4 = require('proj4');

// מערכות קואורדינטות
const WGS84 = 'EPSG:4326';
const ITM = '+proj=tmerc +lat_0=31.73439361111111 +lon_0=35.20451694444445 ' +
  '+k=1.0000067 +x_0=219529.584 +y_0=626907.39 +ellps=GRS80 +units=m +no_defs';

// פונקציית המרה
function convertLatLonToITM(lat, lon) {
  const [x, y] = proj4(WGS84, ITM, [lon, lat]);
  return {
    x: Math.round(x),
    y: Math.round(y)
  };
}

module.exports = { convertLatLonToITM };
