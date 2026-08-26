// app.js — точка входа приложения / main entry point of the app
// Здесь инициализируется карта, загружаются данные и подключаются обработчики UI
// This file initializes the map, loads data, and wires up UI event handlers

import { initMap } from './modules/map.js';
import { initGeolocation } from './modules/geolocation.js';
import { loadWaterways, setNonNavigableVisible } from './modules/waterways.js';
import { loadAccessPoints, setAddMode, isAddModeActive, exportUserPointsAsJson, clearUserPoints } from './modules/accessPoints.js';
import { initI18n, t } from './modules/i18n.js';

// Создаём карту Leaflet в контейнере с id="map" / Create the Leaflet map inside the #map container
const map = initMap('map');

// Инициализация переключателя языка (UA/RU/DE/EN) / Init language switcher (UA/RU/DE/EN)
initI18n(document.getElementById('lang-select'));

// Загружаем водные пути (каналы, реки) и точки доступа на карту
// Load waterways (canals, rivers) and access points onto the map
loadWaterways(map);
loadAccessPoints(map);

// Кнопка "Мой местоположение" — определяет и показывает позицию пользователя
// "My location" button — detects and shows the user's current position
document.getElementById('locate-btn').addEventListener('click', () => {
  initGeolocation(map);
});

// Чекбокс "показывать непроходимые участки" — переключает видимость линий, где нельзя пройти на байдарке
// "Show non-navigable" checkbox — toggles visibility of waterway segments that are not passable by kayak
const toggleEl = document.getElementById('toggle-non-navigable');
if (toggleEl) {
  setNonNavigableVisible(map, toggleEl.checked);
  toggleEl.addEventListener('change', (e) => {
    setNonNavigableVisible(map, e.target.checked);
  });
}

// Кнопка "добавить точку" — включает/выключает режим добавления пользовательской точки на карту
// "Add point" button — toggles the mode for adding a custom user point on the map
const addPointBtn = document.getElementById('add-point-btn');
if (addPointBtn) {
  addPointBtn.addEventListener('click', () => {
    const active = !isAddModeActive();
    setAddMode(active);
    addPointBtn.textContent = active ? t('addPointActive') : t('addPoint');
  });
  // Слушаем событие смены режима (например, если он был выключен из другого места)
  // Listen for mode-change event (e.g. if it was toggled off elsewhere)
  window.addEventListener('addmode:changed', (e) => {
    addPointBtn.textContent = e.detail.active ? t('addPointActive') : t('addPoint');
  });
}

// Кнопка "экспортировать точки" — выводит все пользовательские точки в виде JSON через окно prompt
// "Export points" button — shows all user-added points as JSON via a prompt dialog
const exportBtn = document.getElementById('export-points-btn');
if (exportBtn) {
  exportBtn.addEventListener('click', () => {
    const json = exportUserPointsAsJson();
    window.prompt(t('exportPoints'), json);
  });
}

// Кнопка "удалить мои точки" — очищает все пользовательские точки из localStorage и с карты
// "Clear my points" button — removes all user-added points from localStorage and the map
const clearBtn = document.getElementById('clear-points-btn');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    clearUserPoints();
  });
}

// При смене языка перезагружаем точки доступа, чтобы обновить их названия на новом языке
// When the language changes, reload access points so their names update to the new language
window.addEventListener('i18n:changed', () => {
  loadAccessPoints(map);
});
