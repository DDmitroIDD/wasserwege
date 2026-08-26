// Waterways module: loads and renders kayak-navigable canal/river polylines from OSM data
let navigableLayer = null;
let nonNavigableLayer = null;

// Some real-world navigable Alster canals are not tagged with boat=yes/canoe=yes
// in OSM, but are commonly paddled. Force them to be treated as navigable by name.
const NAVIGABLE_NAME_OVERRIDES = [
  'brabandkanal',
  'skagerrakkanal',
  'skagerrak-kanal',
  'skagerakkanal',
  'inselkanal',
  'leinpfadkanal',
  'werftkanal'
];

function isNameOverriddenNavigable(name) {
  if (!name) return false;
  const normalized = name.toLowerCase();
  return NAVIGABLE_NAME_OVERRIDES.some((n) => normalized.includes(n));
}

async function loadWaterwaySource(url) {
  const response = await fetch(url);
  const data = await response.json();

  data.features.forEach((feature) => {
    if (!feature.geometry || feature.geometry.type !== 'LineString') return;

    const props = feature.properties || {};
    const name = props.name || props['name:en'] || props['@id'] || 'Waterway';
    const boatAllowed =
      props.boat === 'yes' ||
      props.boat === 'canoe' ||
      props.canoe === 'yes' ||
      isNameOverriddenNavigable(name);

    const coords = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    const line = L.polyline(coords, {
      color: boatAllowed ? '#0077b6' : '#999999',
      weight: boatAllowed ? 4 : 2,
      opacity: boatAllowed ? 0.8 : 0.4,
      dashArray: boatAllowed ? null : '4 4'
    }).bindPopup(name);

    if (boatAllowed) {
      navigableLayer.addLayer(line);
    } else {
      nonNavigableLayer.addLayer(line);
    }
  });
}

export async function loadWaterways(map) {
  navigableLayer = L.layerGroup().addTo(map);
  nonNavigableLayer = L.layerGroup().addTo(map);

  try {
    await loadWaterwaySource('data/waterways-raw-osm.json');
  } catch (err) {
    console.error('Failed to load waterways:', err);
  }
  try {
    await loadWaterwaySource('data/waterways-extra.json');
  } catch (err) {
    console.error('Failed to load extra waterways:', err);
  }
}

export function setNonNavigableVisible(map, visible) {
  if (!nonNavigableLayer) return;
  if (visible) {
    if (!map.hasLayer(nonNavigableLayer)) map.addLayer(nonNavigableLayer);
  } else {
    if (map.hasLayer(nonNavigableLayer)) map.removeLayer(nonNavigableLayer);
  }
}
