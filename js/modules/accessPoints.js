// Access points module: loads and renders launch/exit/mooring points
import { t } from './i18n.js';

const iconColors = {
  launch: 'green',
  exit: 'orange',
  mooring: 'blue'
};

let pointsLayer = null;
let cachedData = null;

function createIcon(type) {
  const color = iconColors[type] || 'gray';
  return L.divIcon({
    className: 'access-point-icon',
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 3px rgba(0,0,0,0.5);"></div>`,
    iconSize: [14, 14]
  });
}

function renderPoints(map, data) {
  if (pointsLayer) {
    map.removeLayer(pointsLayer);
  }

  pointsLayer = L.layerGroup();

  data.points.forEach((point) => {
    L.marker([point.lat, point.lng], { icon: createIcon(point.type) })
      .bindPopup(`<b>${point.name}</b><br>${t(point.type)}`)
      .addTo(pointsLayer);
  });

  pointsLayer.addTo(map);
}

export async function loadAccessPoints(map) {
  try {
    if (!cachedData) {
      const response = await fetch('data/access-points.json');
      cachedData = await response.json();
    }
    renderPoints(map, cachedData);
  } catch (err) {
    console.error('Failed to load access points:', err);
  }
}
