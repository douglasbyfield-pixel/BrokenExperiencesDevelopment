#!/usr/bin/env bun

import { db } from "@server/db";
import { experience } from "@server/db/schema";
import { eq } from "drizzle-orm";

async function updateExistingLocations() {
  console.log("🌍 Starting location update for existing experiences...");
  
  // Get all experiences that only have "Jamaica" as address
  const experiencesToUpdate = await db.select({
    id: experience.id,
    latitude: experience.latitude, 
    longitude: experience.longitude,
    address: experience.address,
    title: experience.title
  }).from(experience)
  .where(eq(experience.address, "Jamaica"));

  console.log(`📍 Found ${experiencesToUpdate.length} experiences to update`);

  if (experiencesToUpdate.length === 0) {
    console.log("✅ No experiences need location updates");
    return;
  }

  // Function to get detailed address from coordinates
  async function getDetailedAddress(lat: string, lng: string): Promise<string> {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      
      console.log(`🌍 API response for ${lat}, ${lng}:`, JSON.stringify(data, null, 2));
      
      const components: string[] = [];
      
      // Get most specific location parts first
      if (data.localityInfo?.informative) {
        data.localityInfo.informative.forEach((info: any) => {
          if (info.name && info.order < 5) {
            components.push(info.name);
          }
        });
      }
      
      // Administrative areas (neighborhoods, districts, parishes)
      if (data.localityInfo?.administrative) {
        data.localityInfo.administrative.forEach((admin: any, index: number) => {
          if (index < 3 && admin.name && admin.name !== 'Jamaica') {
            components.push(admin.name);
          }
        });
      }
      
      // Additional detailed fields
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
      
      // Remove duplicates and empty values
      const uniqueComponents = Array.from(new Set(components.filter(Boolean)));
      
      // Create address
      let address = uniqueComponents.length > 0 
        ? uniqueComponents.slice(0, 3).join(", ")
        : data.plusCode || data.locality || null;
      
      // Fallback to coordinates if no detailed address
      if (!address || address === "Jamaica") {
        const latRounded = parseFloat(lat).toFixed(4);
        const lngRounded = parseFloat(lng).toFixed(4);
        address = `Location at ${latRounded}°N, ${lngRounded}°W`;
      }
      
      console.log(`📍 Generated address: ${address}`);
      return address;
      
    } catch (error) {
      console.error(`❌ Error getting address for ${lat}, ${lng}:`, error);
      // Fallback to coordinate-based address
      const latRounded = parseFloat(lat).toFixed(4);
      const lngRounded = parseFloat(lng).toFixed(4);
      return `Location at ${latRounded}°N, ${lngRounded}°W`;
    }
  }

  // Update each experience
  let updatedCount = 0;
  for (const exp of experiencesToUpdate) {
    try {
      console.log(`\n🔄 Updating "${exp.title}" (ID: ${exp.id})`);
      console.log(`📍 Current: ${exp.address}`);
      console.log(`📍 Coordinates: ${exp.latitude}, ${exp.longitude}`);
      
      const newAddress = await getDetailedAddress(exp.latitude, exp.longitude);
      
      await db.update(experience)
        .set({ address: newAddress })
        .where(eq(experience.id, exp.id));
      
      console.log(`✅ Updated to: ${newAddress}`);
      updatedCount++;
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to update experience ${exp.id}:`, error);
    }
  }

  console.log(`\n🎉 Successfully updated ${updatedCount} out of ${experiencesToUpdate.length} experiences`);
}

// Run the script
if (import.meta.main) {
  updateExistingLocations()
    .then(() => {
      console.log("✅ Location update script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Script failed:", error);
      process.exit(1);
    });
}