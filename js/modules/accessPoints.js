// Access points module: loads and renders launch/exit points.
// Модуль точек доступа: загружает и отображает точки спуска/выхода.
//
// Supports official points (from data/access-points.json) and
// user-added points stored locally in the browser (localStorage),
// with an export function so users can send new points to the maintainer.
// Поддерживает официальные точки (из data/access-points.json) и
// точки, добавленные пользователем и сохранённые локально (localStorage),
// а также функцию экспорта, чтобы пользователи могли отправить новые точки мейнтейнеру.
import { t } from './i18n.js';

const POINT_COLOR = 'green';
const USER_POINTS_KEY = 'wasserwege_user_points';

// Module-level state / Состояние модуля
let pointsLayer = null;     // Leaflet layer group holding all point markers / слой со всеми маркерами точек
let officialData = null;    // Cached official points data / кэш официальных данных
let map = null;             // Reference to the Leaflet map instance / ссылка на карту Leaflet
let addModeActive = false;  // Whether "add point" mode is active / активен ли режим добавления точки
let pendingLatLng = null;   // Coordinates awaiting confirmation / координаты, ожидающие подтверждения

// Build a colored circular marker icon.
// Строит иконку маркера в виде цветного кружка.
// User-added points get a dashed border to visually distinguish them from official ones.
// Точки, добавленные пользователем, получают пунктирную рамку, чтобы отличать их от официальных.
function createIcon(isUserPoint) {
  const border = isUserPoint ? '2px dashed #333' : '2px solid white';
  return L.divIcon({
    className: 'access-point-icon',
    html: `<div style="background:${POINT_COLOR};width:14px;height:14px;border-radius:50%;border:${border};box-shadow:0 0 3px rgba(0,0,0,0.5);"></div>`,
    iconSize: [14, 14]
  });
}

// Read user-added points from localStorage.
// Считывает точки, добавленные пользователем, из localStorage.
function getUserPoints() {
  try {
    const raw = localStorage.getItem(USER_POINTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read user points:', err);
    return [];
  }
}

// Persist user-added points to localStorage.
// Сохраняет точки пользователя в localStorage.
function saveUserPoints(points) {
  localStorage.setItem(USER_POINTS_KEY, JSON.stringify(points));
}

// Add a new user point, assigning it a unique id based on timestamp.
// Добавляет новую точку пользователя, присваивая ей уникальный id на основе времени.
function addUserPoint(point) {
  const points = getUserPoints();
  point.id = 'user-' + Date.now();
  points.push(point);
  saveUserPoints(points);
  return point;
}

// Remove a user point by id.
// Удаляет точку пользователя по id.
function removeUserPoint(id) {
  const points = getUserPoints().filter((p) => p.id !== id);
  saveUserPoints(points);
}

// Build the popup DOM content shown when a marker is clicked.
// Строит содержимое всплывающего окна (popup), показываемого при клике на маркер.
// For user points, adds a "user added" badge and a delete button.
// Для точек пользователя добавляет пометку "добавлено пользователем" и кнопку удаления.
function buildPopupContent(point, isUserPoint) {
  const container = document.createElement('div');
  const title = document.createElement('b');
  title.textContent = point.name;
  container.appendChild(title);
  container.appendChild(document.createElement('br'));
  const typeLabel = document.createElement('span');
  typeLabel.textContent = t('point');
  container.appendChild(typeLabel);

  if (isUserPoint) {
    container.appendChild(document.createElement('br'));
    const badge = document.createElement('small');
    badge.textContent = t('userAdded');
    container.appendChild(badge);
    container.appendChild(document.createElement('br'));
    const delBtn = document.createElement('button');
    delBtn.textContent = t('delete');
    delBtn.className = 'popup-delete-btn';
    delBtn.addEventListener('click', () => {
      removeUserPoint(point.id);
      renderAllPoints();
    });
    container.appendChild(delBtn);
  }
  return container;
}

// Redraw all markers (official + user) on the map.
// Перерисовывает все маркеры (официальные + пользовательские) на карте.
// Called after loading data or after any add/remove of a user point.
// Вызывается после загрузки данных или после добавления/удаления точки пользователя.
function renderAllPoints() {
  if (!map) return;
  if (pointsLayer) {
    map.removeLayer(pointsLayer);
  }
  pointsLayer = L.layerGroup();

  const official = (officialData && officialData.points) || [];
  const userPoints = getUserPoints();

  official.forEach((point) => {
    L.marker([point.lat, point.lng], { icon: createIcon(false) })
      .bindPopup(buildPopupContent(point, false))
      .addTo(pointsLayer);
  });

  userPoints.forEach((point) => {
    L.marker([point.lat, point.lng], { icon: createIcon(true) })
      .bindPopup(buildPopupContent(point, true))
      .addTo(pointsLayer);
  });

  pointsLayer.addTo(map);
}

// Handle a click on the map while "add point" mode is active.
// Обрабатывает клик по карте, когда активен режим добавления точки.
function handleMapClick(e) {
  if (!addModeActive) return;
  pendingLatLng = e.latlng;
  openAddPointForm(e.latlng);
}

// Ask the user for a point name (simple prompt) and save the new point.
// Запрашивает у пользователя название точки (простой prompt) и сохраняет новую точку.
// TODO: replace window.prompt with a proper in-app form for better UX.
// TODO: заменить window.prompt на нормальную форму внутри приложения для лучшего UX.
function openAddPointForm(latlng) {
  const name = window.prompt(t('promptPointName'));
  if (!name) {
    setAddMode(false);
    return;
  }
  addUserPoint({ name, type: 'point', lat: latlng.lat, lng: latlng.lng });
  renderAllPoints();
  setAddMode(false);
}

// Toggle "add point" mode on/off; updates cursor style and notifies listeners.
// Переключает режим "добавить точку"; меняет вид курсора и уведомляет слушателей.
export function setAddMode(active) {
  addModeActive = active;
  if (!map) return;
  const container = map.getContainer();
  container.style.cursor = active ? 'crosshair' : '';
  window.dispatchEvent(new CustomEvent('addmode:changed', { detail: { active } }));
}

// Whether "add point" mode is currently active.
// Активен ли сейчас режим "добавить точку".
export function isAddModeActive() {
  return addModeActive;
}

// Export all user-added points as a JSON string, e.g. so the user can
// send them to the maintainer to be added to the official dataset.
// Экспортирует все точки пользователя в виде JSON-строки, например,
// чтобы пользователь мог отправить их мейнтейнеру для добавления в официальные данные.
export function exportUserPointsAsJson() {
  const points = getUserPoints();
  return JSON.stringify({ points }, null, 2);
}

// Remove all user-added points (used by the "clear my points" button).
// Удаляет все точки пользователя (используется кнопкой "очистить мои точки").
export function clearUserPoints() {
  saveUserPoints([]);
  renderAllPoints();
}

// Entry point: loads official points from JSON, renders all points,
// and wires up the map click handler for adding new points.
// Точка входа: загружает официальные точки из JSON, отображает все точки
// и подключает обработчик кликов по карте для добавления новых точек.
export async function loadAccessPoints(leafletMap) {
  map = leafletMap;
  try {
    if (!officialData) {
      const response = await fetch('data/access-points.json');
      officialData = await response.json();
    }
    renderAllPoints();
    map.on('click', handleMapClick);
  } catch (err) {
    console.error('Failed to load access points:', err);
  }
}
