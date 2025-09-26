import type React from "react";
import {
	ScrollView,
	type ScrollViewProps,
	View,
	type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenContainerProps extends ScrollViewProps {
	children: React.ReactNode;
	style?: ViewStyle;
	contentContainerStyle?: ViewStyle;
	withTabBar?: boolean;
	scrollable?: boolean;
}

/**
 * A responsive screen container that handles safe areas and tab bar padding automatically
 *
 * @param withTabBar - Whether to add padding for bottom tab bar (default: true)
 * @param scrollable - Whether content should be scrollable (default: true)
 */
export default function ScreenContainer({
	children,
	style,
	contentContainerStyle,
	withTabBar = true,
	scrollable = true,
	...scrollViewProps
}: ScreenContainerProps) {
	const insets = useSafeAreaInsets();

	// Calculate bottom padding for tab bar
	const bottomPadding = withTabBar
		? 65 + Math.max(insets.bottom, 0) + 25
		: Math.max(insets.bottom, 0);

	const containerStyle = [{ flex: 1 }, style];

	const contentStyle = [
		{ paddingBottom: bottomPadding },
		contentContainerStyle,
	];

	if (scrollable) {
		return (
			<ScrollView
				style={containerStyle}
				contentContainerStyle={contentStyle}
				showsVerticalScrollIndicator={false}
				{...scrollViewProps}
			>
				{children}
			</ScrollView>
		);
	}

	return (
		<View style={[containerStyle, { paddingBottom: bottomPadding }]}>
			{children}
		</View>
	);
}
