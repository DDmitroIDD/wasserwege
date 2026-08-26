import { initMap } from './modules/map.js';
import { initGeolocation } from './modules/geolocation.js';
import { loadWaterways, setNonNavigableVisible } from './modules/waterways.js';
import { loadAccessPoints, setAddMode, isAddModeActive, exportUserPointsAsJson, clearUserPoints } from './modules/accessPoints.js';
import { initI18n, t } from './modules/i18n.js';

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

const addPointBtn = document.getElementById('add-point-btn');
if (addPointBtn) {
  addPointBtn.addEventListener('click', () => {
    const active = !isAddModeActive();
    setAddMode(active);
    addPointBtn.textContent = active ? t('addPointActive') : t('addPoint');
  });
  window.addEventListener('addmode:changed', (e) => {
    addPointBtn.textContent = e.detail.active ? t('addPointActive') : t('addPoint');
  });
}

const exportBtn = document.getElementById('export-points-btn');
if (exportBtn) {
  exportBtn.addEventListener('click', () => {
    const json = exportUserPointsAsJson();
    window.prompt(t('exportPoints'), json);
  });
}

const clearBtn = document.getElementById('clear-points-btn');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    clearUserPoints();
  });
}

window.addEventListener('i18n:changed', () => {
  loadAccessPoints(map);
});
