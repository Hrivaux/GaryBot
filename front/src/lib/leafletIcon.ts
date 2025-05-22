import * as L from 'leaflet';

export const garageIcon = new L.Icon({
  iconUrl: '/garage-point.png',
  iconRetinaUrl: '/garage-point.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
  className: 'garage-icon',
});
