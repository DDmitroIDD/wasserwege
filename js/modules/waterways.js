// Waterways module: loads and renders canal/water polylines from static data
export async function loadWaterways(map) {
  try {
    const response = await fetch('data/waterways.json');
    const data = await response.json();

    data.features.forEach((feature) => {
      const coords = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      L.polyline(coords, {
        color: '#0077b6',
        weight: 4,
        opacity: 0.7
      })
        .addTo(map)
        .bindPopup(feature.properties.name || 'Waterway');
    });
  } catch (err) {
    console.error('Failed to load waterways:', err);
  }
}
