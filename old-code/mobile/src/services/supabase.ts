import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const getCurrentUser = async () => {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	return user;
};

export const getUserProfile = async (userId: string) => {
	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", userId)
		.single();

	return { data, error };
};

export const createUserProfile = async (
	profile: Database["public"]["Tables"]["profiles"]["Insert"],
) => {
	const { data, error } = await supabase
		.from("profiles")
		.insert(profile as any)
		.select()
		.single();

	return { data, error };
};
