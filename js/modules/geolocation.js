// Geolocation module: uses browser Geolocation API
let userMarker = null;

export function initGeolocation(map) {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by this browser.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      if (userMarker) {
        map.removeLayer(userMarker);
      }

      userMarker = L.marker([latitude, longitude]).addTo(map);
      userMarker.bindPopup('You are here').openPopup();
      map.setView([latitude, longitude], 15);
    },
    (error) => {
      alert('Unable to retrieve your location: ' + error.message);
    },
    { enableHighAccuracy: true }
  );
}
