import { initMap } from './modules/map.js';
import { initGeolocation } from './modules/geolocation.js';
import { loadWaterways, setNonNavigableVisible } from './modules/waterways.js';
import { loadAccessPoints } from './modules/accessPoints.js';
import { initI18n } from './modules/i18n.js';

const map = initMap('map');

initI18n(document.getElementById('lang-select'));

loadWaterways(map);
loadAccessPoints(map);

document.getElementById('locate-btn').addEventListener('click', () => {
  initGeolocation(map);
});

const toggleEl = document.getElementById('toggle-non-navigable');
if (toggleEl) {
  setNonNavigableVisible(map, toggleEl.checked);
  toggleEl.addEventListener('change', (e) => {
    setNonNavigableVisible(map, e.target.checked);
  });
}

window.addEventListener('i18n:changed', () => {
  loadAccessPoints(map);
});
