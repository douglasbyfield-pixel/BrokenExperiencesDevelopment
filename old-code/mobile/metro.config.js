const { getDefaultConfig } = require("expo/metro-config");

module.exports = (async () => {
	const config = await getDefaultConfig(__dirname);
	const {
		resolver: { sourceExts, assetExts },
	} = config;

	config.transformer.babelTransformerPath = require.resolve(
		"react-native-svg-transformer",
	);
	config.resolver.assetExts = [
		...assetExts.filter((ext) => ext !== "svg"),
		"ttf",
	];
	config.resolver.sourceExts = [...sourceExts, "svg"];

	return config;
})();
