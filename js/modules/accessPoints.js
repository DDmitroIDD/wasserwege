// Access points module: loads and renders launch/exit points.
// Supports official points (from data/access-points.json) and
// user-added points stored locally in the browser (localStorage),
// with an export function so users can send new points to the maintainer.
import { t } from './i18n.js';

const POINT_COLOR = 'green';
const USER_POINTS_KEY = 'wasserwege_user_points';

let pointsLayer = null;
let officialData = null;
let map = null;
let addModeActive = false;
let pendingLatLng = null;

function createIcon(isUserPoint) {
  const border = isUserPoint ? '2px dashed #333' : '2px solid white';
  return L.divIcon({
    className: 'access-point-icon',
    html: `<div style="background:${POINT_COLOR};width:14px;height:14px;border-radius:50%;border:${border};box-shadow:0 0 3px rgba(0,0,0,0.5);"></div>`,
    iconSize: [14, 14]
  });
}

function getUserPoints() {
  try {
    const raw = localStorage.getItem(USER_POINTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read user points:', err);
    return [];
  }
}

function saveUserPoints(points) {
  localStorage.setItem(USER_POINTS_KEY, JSON.stringify(points));
}

function addUserPoint(point) {
  const points = getUserPoints();
  point.id = 'user-' + Date.now();
  points.push(point);
  saveUserPoints(points);
  return point;
}

function removeUserPoint(id) {
  const points = getUserPoints().filter((p) => p.id !== id);
  saveUserPoints(points);
}

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

function handleMapClick(e) {
  if (!addModeActive) return;
  pendingLatLng = e.latlng;
  openAddPointForm(e.latlng);
}

function openAddPointForm(latlng) {
  const name = window.prompt(t('promptPointName'));
  if (!name) {
    setAddMode(false);
    return;
  }
  addUserPoint({
    name,
    type: 'point',
    lat: latlng.lat,
    lng: latlng.lng
  });
  renderAllPoints();
  setAddMode(false);
}

export function setAddMode(active) {
  addModeActive = active;
  if (!map) return;
  const container = map.getContainer();
  container.style.cursor = active ? 'crosshair' : '';
  window.dispatchEvent(new CustomEvent('addmode:changed', { detail: { active } }));
}

export function isAddModeActive() {
  return addModeActive;
}

export function exportUserPointsAsJson() {
  const points = getUserPoints();
  return JSON.stringify({ points }, null, 2);
}

export function clearUserPoints() {
  saveUserPoints([]);
  renderAllPoints();
}

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
