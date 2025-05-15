import { prisma } from "./lib/db";
import { Prisma } from "@prisma/client";

async function testSearch() {
  try {
    // Try a simple query first
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("Basic query result:", result);
    
    // Check if the function exists
    const functionCheck = await prisma.$queryRaw`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_type = 'FUNCTION' 
        AND routine_name = 'array_to_string_immutable'
    `;
    console.log("Function check:", functionCheck);
    
    // Create the function if it doesn't exist
    if (!Array.isArray(functionCheck) || functionCheck.length === 0) {
      console.log("Creating array_to_string_immutable function...");
      await prisma.$executeRaw`
        CREATE OR REPLACE FUNCTION array_to_string_immutable(anyarray, text)
        RETURNS text
        LANGUAGE sql IMMUTABLE
        AS $function$
        SELECT array_to_string($1, $2);
        $function$;
      `;
    }
    
    // Test if pg_trgm extension is available
    const trgmCheck = await prisma.$queryRaw`
      SELECT 1 
      FROM pg_extension 
      WHERE extname = 'pg_trgm'
    `;
    console.log("pg_trgm check:", trgmCheck);
    
    // Create the extension if it doesn't exist
    if (!Array.isArray(trgmCheck) || trgmCheck.length === 0) {
      console.log("Attempting to create pg_trgm extension...");
      try {
        await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS pg_trgm`;
      } catch (err) {
        console.error("Could not create pg_trgm extension. You may need superuser privileges:", err);
      }
    }
    
    console.log("Test completed");
  } catch (error) {
    console.error("Test error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testSearch();
