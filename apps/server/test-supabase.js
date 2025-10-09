const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://yvsmfemwyfexaelthoed.supabase.co";
const supabaseKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2c21mZW13eWZleGFlbHRob2VkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjczMjMxNiwiZXhwIjoyMDcyMzA4MzE2fQ.A0m6UTjqqNBtJ-fUVdsBo7K-To5N9oKVe8hl5I1gtWM";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
	try {
		const { data, error } = await supabase.from("experience").select("count");
		if (error) {
			console.error("Error:", error);
		} else {
			console.log("Success:", data);
		}
	} catch (err) {
		console.error("Connection failed:", err);
	}
}

testConnection();
