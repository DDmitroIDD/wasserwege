// Access points module: loads and renders official launch/exit points.
// User-submitted points go to Supabase for moderator approval.
// Модуль точек доступа: загружает официальные точки, пользовательские заявки идут в Supabase.

import { t } from './i18n.js';
import { getSupabaseClient } from './supabaseClient.js';

const POINT_COLOR = 'green';

// Module-level state
let pointsLayer = null;
let officialData = null;
let map = null;
let addModeActive = false;
let pendingLatLng = null;

// Build colored circular marker icon.
function createIcon(isUserPoint) {
  const border = isUserPoint ? '2px dashed #333' : '2px solid white';
  return L.divIcon({
    className: 'access-point-icon',
    html: `<div style="background:${POINT_COLOR};width:14px;height:14px;border-radius:50%;border:${border};box-shadow:0 0 3px rgba(0,0,0,0.5);"></div>`,
    iconSize: [14, 14]
  });
}

// Redraw all official markers on the map.
function renderAllPoints() {
  if (!map) return;
  if (pointsLayer) {
    map.removeLayer(pointsLayer);
  }
  pointsLayer = L.layerGroup();
  const official = (officialData && officialData.points) || [];
  official.forEach((point) => {
    L.marker([point.lat, point.lng], { icon: createIcon(false) })
      .bindPopup(buildPopupContent(point, false))
      .addTo(pointsLayer);
  });
  pointsLayer.addTo(map);
}

// Build popup DOM content.
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
  }
  return container;
}

// Handle map click when add mode is active.
function handleMapClick(e) {
  if (!addModeActive) return;
  pendingLatLng = e.latlng;
  openAddPointModal(e.latlng);
}

// Open the add-point modal (defined in index.html).
function openAddPointModal(latlng) {
  const modal = document.getElementById('add-point-modal');
  const nameInput = document.getElementById('add-point-name-input');
  const photoInput = document.getElementById('add-point-photo-input');
  if (!modal) return;
  nameInput.value = '';
  if (photoInput) photoInput.value = '';
  modal.hidden = false;

  document.getElementById('add-point-save-btn').onclick = async () => {
    const name = nameInput.value.trim();
    if (!name) return;
    const photoFile = photoInput ? photoInput.files[0] : null;
    modal.hidden = true;
    setAddMode(false);
    await submitPointForModeration(name, latlng.lat, latlng.lng, photoFile);
  };

  document.getElementById('add-point-cancel-btn').onclick = () => {
    modal.hidden = true;
    setAddMode(false);
  };
}

// Submit a new point to Supabase submitted_points table.
// Optionally uploads a photo to the point-photos storage bucket.
async function submitPointForModeration(name, lat, lng, photoFile) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    window.alert(t('submitError'));
    return;
  }
  try {
    let photoUrl = null;
    if (photoFile) {
      const ext = photoFile.name.split('.').pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('point-photos')
        .upload(fileName, photoFile, { upsert: false });
      if (uploadError) {
        console.error('Photo upload error:', uploadError);
      } else {
        const { data: urlData } = supabase.storage
          .from('point-photos')
          .getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }
    }
    const { error: insertError } = await supabase
      .from('submitted_points')
      .insert([{ name, lat, lng, photo_url: photoUrl, status: 'pending' }]);
    if (insertError) {
      console.error('Insert error:', insertError);
      window.alert(t('submitError'));
    } else {
      window.alert(t('submitted'));
    }
  } catch (err) {
    console.error('submitPointForModeration error:', err);
    window.alert(t('submitError'));
  }
}

// Toggle "add point" mode on/off.
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

// Export functions no longer needed (no localStorage points), kept for API compatibility.
export function exportUserPointsAsJson() {
  return JSON.stringify({ points: [] }, null, 2);
}

export function clearUserPoints() {
  // no-op: user points now go through moderation, not localStorage
}

// Entry point: load official points and wire up map click handler.
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
