import { initMap } from './modules/map.js';
import { initGeolocation } from './modules/geolocation.js';
import { loadWaterways } from './modules/waterways.js';
import { loadAccessPoints } from './modules/accessPoints.js';
import { initI18n } from './modules/i18n.js';

const map = initMap('map');

initI18n(document.getElementById('lang-select'));

loadWaterways(map);
loadAccessPoints(map);

document.getElementById('locate-btn').addEventListener('click', () => {
  initGeolocation(map);
});

window.addEventListener('i18n:changed', () => {
  loadAccessPoints(map);
});
