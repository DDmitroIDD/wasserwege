// Waterways module: loads and renders kayak-navigable canal/river polylines from OSM data.
// Also collects all waterway coordinates so other modules (accessPoints)
// can validate that a new point is close enough to water.
// Модуль водных путей: загружает и отрисовывает линии каналов/рек, проходимые
// на каяке, из данных OSM. Также собирает все координаты водных путей, чтобы
// другие модули (accessPoints) могли проверять, что новая точка находится
// достаточно близко к воде.
let navigableLayer = null;
let nonNavigableLayer = null;

// Flat list of all waterway line segments (both navigable and not), used for
// distance-to-water checks when validating user-submitted points.
// Each entry is an array of [lat, lng] pairs representing one line.
// Плоский список всех отрезков линий водных путей (судоходных и нет),
// используется для проверки расстояния до воды при валидации точек
// пользователя. Каждый элемент — массив пар [lat, lng] одной линии.
let allWaterwayLines = [];

// Some real-world navigable Alster canals are not tagged with boat=yes/canoe=yes
// in OSM, but are commonly paddled. Force them to be treated as navigable by name.
// Некоторые реальные судоходные каналы Альстера не подписаны в OSM как
// boat=yes/canoe=yes, но на них реально катаются. Вынуждаем считать их
// судоходными по названию.
const NAVIGABLE_NAME_OVERRIDES = [
  'brabandkanal',
  'skagerrakkanal',
  'skagerrak-kanal',
  'inselkanal',
  'leinpfadkanal',
  'werftkanal'
];

// Check if a waterway's name matches one of the manual override names.
// Проверяет, совпадает ли название водного пути с одним из ручных исключений.
function isNameOverriddenNavigable(name) {
  if (!name) return false;
  const normalized = name.toLowerCase();
  return NAVIGABLE_NAME_OVERRIDES.some((n) => normalized.includes(n));
}

// Fetch a GeoJSON waterway source, build a polyline per feature, and
// place it into the navigable or non-navigable layer based on tags.
// Also records the coordinates into allWaterwayLines for later validation.
// Загружает источник GeoJSON, строит линию для каждого объекта и помещает
// её в судоходный или несудоходный слой на основе тегов. Также сохраняет
// координаты в allWaterwayLines для последующей валидации.
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

    // GeoJSON stores coordinates as [lng, lat]; Leaflet expects [lat, lng].
    // GeoJSON хранит координаты как [lng, lat]; Leaflet ожидает [lat, lng].
    const coords = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    allWaterwayLines.push(coords);

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

// Entry point: creates the two layer groups and loads both the main OSM
// waterway dataset and a supplementary "extra" dataset (manual additions).
// Точка входа: создаёт два слоя и загружает основной набор данных OSM
// и дополнительный набор "extra" (ручные добавления).
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

// Show or hide the non-navigable waterways layer (toggled by the legend checkbox).
// Показывает или скрывает слой несудоходных путей (через чекбокс в легенде).
export function setNonNavigableVisible(map, visible) {
  if (!nonNavigableLayer) return;
  if (visible) {
    if (!map.hasLayer(nonNavigableLayer)) map.addLayer(nonNavigableLayer);
  } else {
    if (map.hasLayer(nonNavigableLayer)) map.removeLayer(nonNavigableLayer);
  }
}

// Approximate distance in meters between two lat/lng points (haversine formula).
// Приблизительное расстояние в метрах между двумя точками lat/lng (формула гаверсинуса).
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters / радиус Земли в метрах
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Distance in meters from a point to a line segment (lat/lng approximated as planar
// for short distances, which is accurate enough at city scale).
// Расстояние в метрах от точки до отрезка линии (lat/lng приближённо как
// плоские координаты для коротких расстояний — этого достаточно в масштабе города).
function distanceToSegment(lat, lng, lat1, lng1, lat2, lng2) {
  const x = lng, y = lat;
  const x1 = lng1, y1 = lat1;
  const x2 = lng2, y2 = lat2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((x - x1) * dx + (y - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return haversineDistance(lat, lng, projY, projX);
}

// Returns the minimum distance in meters from the given point to any
// loaded waterway line. Returns Infinity if no waterway data is loaded.
// Возвращает минимальное расстояние в метрах от заданной точки до любой
// загруженной линии водного пути. Возвращает Infinity, если данные не загружены.
export function distanceToNearestWaterway(lat, lng) {
  let min = Infinity;
  allWaterwayLines.forEach((line) => {
    for (let i = 0; i < line.length - 1; i++) {
      const [lat1, lng1] = line[i];
      const [lat2, lng2] = line[i + 1];
      const d = distanceToSegment(lat, lng, lat1, lng1, lat2, lng2);
      if (d < min) min = d;
    }
  });
  return min;
}
