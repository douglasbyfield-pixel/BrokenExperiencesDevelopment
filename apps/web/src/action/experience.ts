"use server";
import { eden } from "@web/lib/eden";
import { authActionClient, actionClient } from "@web/lib/safe-action";
import { z } from "zod";

export const createExperienceAction = actionClient
  .inputSchema(
    z.object({
      categoryId: z.string(),
      title: z.string().optional(),
      description: z.string().min(1, "Please describe your experience"),
      latitude: z.string(),
      longitude: z.string(),
      address: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    console.log("🚀 Creating experience with input:", parsedInput);

    // Get Supabase session for authentication
    const { createClient } = await import("@web/lib/supabase/server");
    const supabase = await createClient();
    
    // ⚠️ CRITICAL FIX: Use getUser() instead of getSession()
    // getUser() validates the token with Supabase Auth server
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log("🔐 Supabase user check:", {
      hasUser: !!user,
      userId: user?.id,
      userName: user?.user_metadata?.name,
      userEmail: user?.email,
      fullMetadata: user?.user_metadata,
      error: userError,
    });

    if (!user || userError) {
      throw new Error("You must be logged in to create an experience");
    }

    // Get the access token from the session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error("No access token available");
    }

    // Ensure title meets server requirements (min 5 chars)
    const title = parsedInput.title && parsedInput.title.length >= 5
      ? parsedInput.title
      : parsedInput.description.length >= 5
      ? parsedInput.description.substring(0, 100)
      : "Experience Report";

    const payload = {
      categoryId: parsedInput.categoryId,
      title: title,
      description: parsedInput.description,
      latitude: parsedInput.latitude,
      longitude: parsedInput.longitude,
      address: parsedInput.address,
    };

    console.log("Creating experience with payload:", payload);
    console.log("🔑 Sending Authorization header:", `Bearer ${session.access_token.substring(0, 20)}...`);

    // Use direct fetch instead of Eden Treaty to ensure headers are sent correctly
    const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
    const response = await fetch(`${apiUrl}/experience`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    });

    console.log("📡 Response status:", response.status);
    const responseData = await response.json();
    console.log("📡 Response data:", responseData);

    if (!response.ok) {
      throw new Error(`Failed to create experience: ${JSON.stringify(responseData)}`);
    }

    return responseData;
  });

export const voteOnExperienceAction = actionClient
  .inputSchema(
    z.object({
      experienceId: z.string(),
      vote: z.boolean(),
    }),
  )
  .action(async ({ parsedInput }) => {
    // Get Supabase session for authentication
    const { createClient } = await import("@web/lib/supabase/server");
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("You must be logged in to vote");
    }

    const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
    const response = await fetch(`${apiUrl}/experience/${parsedInput.experienceId}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ vote: parsedInput.vote }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to vote: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  });