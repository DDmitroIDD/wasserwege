// Map module: initializes Leaflet map with OSM tiles
export function initMap(containerId) {
  const map = L.map(containerId).setView([53.5511, 9.9937], 13); // Hamburg center

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  return map;
}
