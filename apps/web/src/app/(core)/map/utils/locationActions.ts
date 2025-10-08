import { mapOperations } from './mapOperations';

// Helper function to calculate distance between two points
const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export const locationActions = {
  reportIssueHere: (location: { lat: number; lng: number }) => {
    console.log("📍 Report issue at:", location);
    alert(`Report issue at: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
  },
  
  findNearbyIssues: (
    location: { lat: number; lng: number }, 
    experiences: any[], 
    map: any
  ) => {
    const nearby = experiences.filter((experience) => {
      const distance = getDistance(
        location.lat,
        location.lng,
        Number(experience.latitude),
        Number(experience.longitude),
      );
      return distance <= 2;
    });
    
    if (nearby.length > 0) {
      mapOperations.fitBoundsToExperiences(map, nearby);
      alert(`Found ${nearby.length} issues within 2km of your location!`);
    } else {
      alert("No issues found within 2km of your location.");
    }
  },
  
  showClosestIssue: (
    location: { lat: number; lng: number }, 
    experiences: any[], 
    map: any, 
    setSelectedExperience: (experience: any) => void
  ) => {
    if (experiences.length === 0) {
      alert("No issues available to show.");
      return;
    }
    
    let closestExperience = experiences[0];
    let closestDistance = getDistance(
      location.lat,
      location.lng,
      Number(closestExperience.latitude),
      Number(closestExperience.longitude),
    );
    
    experiences.forEach((experience) => {
      const distance = getDistance(
        location.lat,
        location.lng,
        Number(experience.latitude),
        Number(experience.longitude),
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closestExperience = experience;
      }
    });
    
    mapOperations.flyToExperience(map, closestExperience);
    setSelectedExperience(closestExperience);
    console.log(
      `Closest issue: ${closestExperience.title} (${closestDistance.toFixed(2)}km away)`,
    );
  },

  shareLocation: (location: { lat: number; lng: number }) => {
    const locationText = `My location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
    navigator.clipboard.writeText(locationText);
    console.log("📤 Location copied to clipboard");
    alert("Location copied to clipboard!");
  }
};
