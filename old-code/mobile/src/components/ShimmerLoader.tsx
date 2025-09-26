import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

interface ShimmerLoaderProps {
	width?: number | string;
	height?: number;
	borderRadius?: number;
	style?: any;
}

const { width: screenWidth } = Dimensions.get("window");

export default function ShimmerLoader({
	width = "100%",
	height = 20,
	borderRadius = 4,
	style,
}: ShimmerLoaderProps) {
	const animatedValue = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(animatedValue, {
					toValue: 1,
					duration: 1000,
					useNativeDriver: false,
				}),
				Animated.timing(animatedValue, {
					toValue: 0,
					duration: 1000,
					useNativeDriver: false,
				}),
			]),
		);

		animation.start();

		return () => animation.stop();
	}, []);

	const translateX = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [-screenWidth, screenWidth],
	});

	const opacity = animatedValue.interpolate({
		inputRange: [0, 0.5, 1],
		outputRange: [0.3, 0.7, 0.3],
	});

	return (
		<View style={[styles.container, { width, height, borderRadius }, style]}>
			<Animated.View
				style={[
					styles.shimmer,
					{
						transform: [{ translateX }],
						opacity,
					},
				]}
			/>
		</View>
	);
}

// Create a skeleton for issue cards
export function IssueCardSkeleton() {
	return (
		<View style={styles.cardSkeleton}>
			<View style={styles.cardHeader}>
				<ShimmerLoader width={30} height={30} borderRadius={15} />
				<View style={styles.cardHeaderText}>
					<ShimmerLoader width="60%" height={16} />
					<ShimmerLoader width="40%" height={12} style={{ marginTop: 4 }} />
				</View>
			</View>

			<ShimmerLoader width="90%" height={20} style={{ marginVertical: 8 }} />
			<ShimmerLoader width="75%" height={16} style={{ marginVertical: 4 }} />
			<ShimmerLoader width="85%" height={16} style={{ marginVertical: 4 }} />

			<ShimmerLoader
				width="100%"
				height={200}
				borderRadius={8}
				style={{ marginVertical: 12 }}
			/>

			<View style={styles.cardFooter}>
				<ShimmerLoader width={60} height={30} borderRadius={15} />
				<ShimmerLoader width={60} height={30} borderRadius={15} />
				<ShimmerLoader width={60} height={30} borderRadius={15} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#f0f0f0",
		overflow: "hidden",
	},
	shimmer: {
		width: "100%",
		height: "100%",
		backgroundColor: "#ffffff",
		opacity: 0.7,
	},
	cardSkeleton: {
		backgroundColor: "#ffffff",
		margin: 16,
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#f0f0f0",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	cardHeaderText: {
		flex: 1,
		marginLeft: 12,
	},
	cardFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 12,
	},
});
