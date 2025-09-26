import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { AnimationUtils, GamificationAnimations } from "../utils/animations";

interface ProgressBarProps {
	progress: number; // 0 to 1
	height?: number;
	backgroundColor?: string;
	fillColor?: string;
	showPercentage?: boolean;
	animated?: boolean;
	duration?: number;
}

export default function ProgressBar({
	progress,
	height = 8,
	backgroundColor = "#e0e0e0",
	fillColor = "#4CAF50",
	showPercentage = false,
	animated = true,
	duration = 1000,
}: ProgressBarProps) {
	const widthValue = useRef(new Animated.Value(0)).current;
	const opacityValue = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (animated) {
			// Animate progress fill
			GamificationAnimations.progressFill(
				widthValue,
				progress,
				duration,
			).start();
			AnimationUtils.fadeIn(opacityValue, 300).start();
		} else {
			widthValue.setValue(progress);
			opacityValue.setValue(1);
		}
	}, [progress, animated, duration]);

	const percentage = Math.round(progress * 100);

	return (
		<View style={styles.container}>
			<View
				style={[
					styles.track,
					{
						height,
						backgroundColor,
					},
				]}
			>
				<Animated.View
					style={[
						styles.fill,
						{
							height,
							backgroundColor: fillColor,
							width: widthValue.interpolate({
								inputRange: [0, 1],
								outputRange: ["0%", "100%"],
								extrapolate: "clamp",
							}),
							opacity: opacityValue,
						},
					]}
				/>
			</View>

			{showPercentage && (
				<Text style={styles.percentageText}>{percentage}%</Text>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
	},
	track: {
		flex: 1,
		borderRadius: 4,
		overflow: "hidden",
	},
	fill: {
		borderRadius: 4,
	},
	percentageText: {
		fontSize: 12,
		fontWeight: "600",
		color: "#666",
		marginLeft: 8,
		minWidth: 35,
		textAlign: "right",
	},
});
