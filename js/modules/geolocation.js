// geolocation.js — модуль определения местоположения через Geolocation API браузера
// Geolocation module: uses the browser's Geolocation API to find and show the user's position

// Ссылка на маркер местоположения пользователя, чтобы можно было удалить старый при повторном клике
// Reference to the user's location marker, so the previous one can be removed on repeated clicks
let userMarker = null;

// Определяет текущее местоположение и ставит маркер на карте
// Detects the current position and places a marker on the map
export function initGeolocation(map) {
  // Браузер не поддерживает Geolocation API — выходим
  // Browser doesn't support the Geolocation API — bail out
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by this browser.');
    return;
  }

  // Запрашиваем текущие координаты у браузера (показывается запрос разрешения)
  // Ask the browser for the current coordinates (triggers a permission prompt)
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      // Убираем старый маркер, если он уже был установлен раньше
      // Remove the previous marker if one already exists
      if (userMarker) {
        map.removeLayer(userMarker);
      }

      // Ставим новый маркер на текущую позицию и показываем всеплывающую подсказку
      // Place a new marker at the current position and show a popup
      userMarker = L.marker([latitude, longitude]).addTo(map);
      userMarker.bindPopup('You are here').openPopup();
      // Центрируем карту на пользователе с приближением / Center the map on the user with closer zoom
      map.setView([latitude, longitude], 15);
    },
    (error) => {
      // Не удалось определить местоположение (отказано в разрешении, таймаут и т.д.)
      // Failed to determine location (permission denied, timeout, etc.)
      alert('Unable to retrieve your location: ' + error.message);
    },
    { enableHighAccuracy: true } // запрашиваем точные данные GPS, если доступны / request precise GPS data if available
  );
}
