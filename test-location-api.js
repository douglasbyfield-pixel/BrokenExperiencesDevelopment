// Test BigDataCloud API with Jamaica coordinates
async function testLocationAPI() {
  // Sample Jamaica coordinates (Kingston area)
  const lat = "17.9712";
  const lng = "-76.7936";
  
  try {
    console.log(`🌍 Testing location API for coordinates: ${lat}, ${lng}`);
    
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    
    const data = await response.json();
    console.log("📍 Full API Response:", JSON.stringify(data, null, 2));
    
    // Test our UPDATED parsing logic
    const components = [];
    
    // Prioritize local administrative areas first (parishes, counties, cities)
    if (data.localityInfo?.administrative) {
      data.localityInfo.administrative.forEach((admin) => {
        // Focus on parish/county level (adminLevel 5-6) and city level
        if (admin.adminLevel >= 5 && admin.name && admin.name !== 'Jamaica') {
          components.push(admin.name);
        }
      });
    }
    
    // Add most specific informative locations (cities, neighborhoods)
    if (data.localityInfo?.informative) {
      data.localityInfo.informative.forEach((info) => {
        // Focus on city-level informative data (order 10+)
        if (info.order >= 10 && info.name && !info.description?.includes('continent') && !info.description?.includes('sea')) {
          components.push(info.name);
        }
      });
    }
    
    // Additional fields
    if (data.locality && !components.includes(data.locality)) {
      components.push(data.locality);
    }
    if (data.city && !components.includes(data.city)) {
      components.push(data.city);
    }
    if (data.countrySubdivision && !components.includes(data.countrySubdivision)) {
      components.push(data.countrySubdivision);
    }
    if (data.principalSubdivision && !components.includes(data.principalSubdivision)) {
      components.push(data.principalSubdivision);
    }
    
    const uniqueComponents = Array.from(new Set(components.filter(Boolean)));
    
    let address = uniqueComponents.length > 0 
      ? uniqueComponents.slice(0, 3).join(", ")
      : data.plusCode || data.locality || null;
    
    if (!address || address === "Jamaica") {
      const latRounded = parseFloat(lat).toFixed(4);
      const lngRounded = parseFloat(lng).toFixed(4);
      address = `Location at ${latRounded}°N, ${lngRounded}°W`;
    }
    
    console.log("🏗️ Parsing Results:");
    console.log("- All components:", components);
    console.log("- Unique components:", uniqueComponents);
    console.log("- Final address:", address);
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testLocationAPI();