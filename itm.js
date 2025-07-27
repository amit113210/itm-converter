'use strict';

function $(id) {
  return document.getElementById(id);
}

function onload() {
  proj4.defs("ITM", "+proj=tmerc +lat_0=31.73439361111111 +lon_0=35.20451694444445 +k=1.0000067 +x_0=219529.584 +y_0=626907.39 +ellps=GRS80 +towgs84=-48,55,52,0,0,0,0 +units=m +no_defs");
  computeLatLngToITM();
  computeITMToLatLng();
}

function updateOsmEmbedUrl(latitude, longitude) {
  const width = 0.005;
  var params = {};
  params.marker = latitude + ',' + longitude;
  params.bbox = (longitude - width) + ',' + (latitude - width) + ',' + (longitude + width) + ',' + (latitude + width);
  const urlParams = new URLSearchParams(params);
  const url = 'https://www.openstreetmap.org/export/embed.html?' + urlParams.toString();
  $('osm-iframe').src = url;
}

function computeLatLngToITM() {
  var latitude = parseFloat($('lat').value);
  var longitude = parseFloat($('long').value);
  var itm_north, itm_east, old_grid_north, old_grid_east;
  if (isNaN(latitude) || isNaN(longitude)) {
    itm_north = 'Invalid';
    itm_east = '';
    old_grid_north = 'Invalid';
    old_grid_east = '';
  }
  else {
    var itm_coords = proj4('EPSG:4326', 'ITM', [longitude, latitude]);
    old_grid_east = (itm_coords[0] - 50000).toFixed(0);
    old_grid_north = itm_coords[1] - 500000;
    if (old_grid_north < 0) {
      old_grid_north += 1000000;
    }
    old_grid_north = old_grid_north.toFixed(0);
    itm_east = itm_coords[0].toFixed(0);
    itm_north = itm_coords[1].toFixed(0);
  }
  $('itm_east').innerHTML = itm_east;
  $('itm_north').innerHTML = itm_north;
  $('oldgrid_east').innerHTML = old_grid_east;
  $('oldgrid_north').innerHTML = old_grid_north;
  updateOsmEmbedUrl(latitude, longitude);
}

function computeITMToLatLng() {
  var itm_east = parseFloat($('itm_east_src').value);
  var itm_north = parseFloat($('itm_north_src').value);
  var latitude, longitude;
  if (isNaN(itm_east) || isNaN(itm_north)) {
    latitude = 'Invalid';
    longitude = 'Invalid';
  } else {
    var lng_lat = proj4('ITM', 'EPSG:4326', [itm_east, itm_north]);
    longitude = lng_lat[0].toFixed(6);
    latitude = lng_lat[1].toFixed(6);
    updateOsmEmbedUrl(lng_lat[1], lng_lat[0]);
  }
  $('lat_dest').innerHTML = latitude;
  $('lng_dest').innerHTML = longitude;
}
