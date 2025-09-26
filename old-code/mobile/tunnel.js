const { execSync } = require("child_process");

console.log("🚀 Starting BrokenExp with public tunnel...\n");
console.log("This will make your app accessible from anywhere!\n");

try {
	// Start expo with tunnel, answering yes to any prompts
	execSync("npx expo start --tunnel", {
		stdio: "inherit",
		env: {
			...process.env,
			CI: "true", // This might help with non-interactive mode
		},
	});
} catch (error) {
	console.error("Error starting tunnel:", error.message);
}
