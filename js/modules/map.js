// map.js — модуль инициализации карты Leaflet с тайлами OpenStreetMap
// Map module: initializes the Leaflet map instance with OpenStreetMap tiles

// Создаёт и возвращает карту Leaflet внутри элемента с указанным id
// Creates and returns a Leaflet map instance inside the element with the given id
export function initMap(containerId) {
  // Стартовый вид: центр Гамбурга, zoom 13 / Initial view: center of Hamburg, zoom level 13
  const map = L.map(containerId).setView([53.5511, 9.9937], 13); // Hamburg center

  // Подключаем тайлы OpenStreetMap (бесплатные, без Google Maps)
  // Attach OpenStreetMap tile layer (free, no Google Maps dependency)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  return map;
}
