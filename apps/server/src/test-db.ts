// Quick database test script
import { db } from "./db";
import { sql } from "drizzle-orm";
import { activityPoints, userProfile } from "./db/schema";

async function testDatabase() {
  try {
    console.log("Testing database connection...");
    
    // Test 1: Check if we can connect
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log("✅ Database connection works:", result);
    
    // Test 2: Check if activity_points table exists
    try {
      const tableCheck = await db.execute(sql`
        SELECT table_name FROM information_schema.tables 
        WHERE table_name = 'activity_points' AND table_schema = 'public'
      `);
      console.log("✅ activity_points table exists:", tableCheck.length > 0);
    } catch (e) {
      console.log("❌ activity_points table check failed:", e);
    }
    
    // Test 3: Check if user_profile table exists
    try {
      const profileCheck = await db.execute(sql`
        SELECT table_name FROM information_schema.tables 
        WHERE table_name = 'user_profile' AND table_schema = 'public'
      `);
      console.log("✅ user_profile table exists:", profileCheck.length > 0);
    } catch (e) {
      console.log("❌ user_profile table check failed:", e);
    }
    
    // Test 4: Try to query activity_points using Drizzle query builder
    try {
      const activityQuery = await db.query.activityPoints.findMany({ limit: 1 });
      console.log("✅ Can query activity_points with Drizzle:", activityQuery);
    } catch (e) {
      console.log("❌ activity_points Drizzle query failed:", e);
    }
    
    // Test 5: Try raw SQL on activity_points
    try {
      const rawQuery = await db.execute(sql`SELECT COUNT(*) as count FROM activity_points`);
      console.log("✅ Raw activity_points query:", rawQuery);
    } catch (e) {
      console.log("❌ Raw activity_points query failed:", e);
    }
    
    // Test 6: Check column structure
    try {
      const columns = await db.execute(sql`
        SELECT column_name, data_type FROM information_schema.columns 
        WHERE table_name = 'activity_points' ORDER BY ordinal_position
      `);
      console.log("✅ activity_points columns:", columns);
    } catch (e) {
      console.log("❌ Column check failed:", e);
    }
    
  } catch (error) {
    console.error("❌ Database test failed:", error);
  }
}

testDatabase();