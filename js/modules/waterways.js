// Waterways module: loads and renders kayak-navigable canal/river polylines from OSM data
export async function loadWaterways(map) {
  try {
    const response = await fetch('data/waterways-raw-osm.json');
    const data = await response.json();

    data.features.forEach((feature) => {
      if (!feature.geometry || feature.geometry.type !== 'LineString') return;

      const props = feature.properties || {};
      const name = props.name || props['name:en'] || props['@id'] || 'Waterway';
      const boatAllowed = props.boat === 'yes' || props.boat === 'canoe' || props.canoe === 'yes';

      const coords = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      L.polyline(coords, {
        color: boatAllowed ? '#0077b6' : '#999999',
        weight: boatAllowed ? 4 : 2,
        opacity: boatAllowed ? 0.8 : 0.4,
        dashArray: boatAllowed ? null : '4 4'
      })
        .addTo(map)
        .bindPopup(name);
    });
  } catch (err) {
    console.error('Failed to load waterways:', err);
  }
}
