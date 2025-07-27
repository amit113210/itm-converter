function wgs84ToItm(lat, lon) {
    var deg2rad = Math.PI / 180;

    var a = 6378137;
    var b = 6356752.3141;
    var f = (a - b) / a;
    var e = Math.sqrt(2 * f - f * f);

    var lon0 = 35.2045169444444 * deg2rad;
    var lat0 = 31.7343936111111 * deg2rad;
    var k0 = 1.0000067;
    var falseE = 219529.584;
    var falseN = 626907.39;

    lat *= deg2rad;
    lon *= deg2rad;

    var n = (a - b) / (a + b);
    var A = a * (1 - n + (5 / 4) * (n * n - n * n * n) + (81 / 64) * (n * n * n * n - n * n * n * n * n));
    var T = Math.tan(lat) * Math.tan(lat);
    var C = (e * e / (1 - e * e)) * Math.pow(Math.cos(lat), 2);
    var A_ = (lon - lon0) * Math.cos(lat);

    var M = a * ((1 - (e * e) / 4 - (3 * e ** 4) / 64 - (5 * e ** 6) / 256) * lat
        - ((3 * e * e) / 8 + (3 * e ** 4) / 32 + (45 * e ** 6) / 1024) * Math.sin(2 * lat)
        + ((15 * e ** 4) / 256 + (45 * e ** 6) / 1024) * Math.sin(4 * lat)
        - (35 * e ** 6) / 3072 * Math.sin(6 * lat));

    var easting = falseE + k0 * A * (A_ + (1 - T + C) * Math.pow(A_, 3) / 6);
    var northing = falseN + k0 * (M + A * Math.tan(lat) * (Math.pow(A_, 2) / 2));

    return {
        x: Math.round(easting * 100) / 100,
        y: Math.round(northing * 100) / 100
    };
}

module.exports = { wgs84ToItm };
