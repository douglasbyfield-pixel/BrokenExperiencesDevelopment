// Map operation utilities
export const mapOperations = {
  flyToExperience: (map: any, experience: any) => {
    if (!map) return;
    map.flyTo({
      center: [Number(experience.longitude), Number(experience.latitude)],
      zoom: 16,
      duration: 1000,
    });
  },
  
  flyToLocation: (map: any, location: { lat: number; lng: number }, zoom = 16.5) => {
    if (!map) return;
    map.flyTo({
      center: [location.lng, location.lat],
      zoom,
      pitch: 68,
      duration: 1500,
    });
  },
  
  fitBoundsToExperiences: (map: any, experiences: any[]) => {
    if (!map || !experiences.length) return;
    
    import("mapbox-gl").then(({ default: mapboxgl }) => {
      const bounds = new mapboxgl.LngLatBounds();
      experiences.forEach((experience) => {
        bounds.extend([Number(experience.longitude), Number(experience.latitude)]);
      });
      
      map.fitBounds(bounds, {
        padding: 50,
        pitch: 68,
        duration: 1500,
      });
    });
  },

  flyToWithPitch: (map: any, center: [number, number], zoom = 16, pitch = 68) => {
    if (!map) return;
    map.flyTo({
      center,
      zoom,
      pitch,
      duration: 1500,
    });
  }
};
