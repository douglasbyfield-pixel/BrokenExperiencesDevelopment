import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
	Dimensions,
	Image,
	Modal,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import CommentInput from "../components/CommentInput";
import CommentItem from "../components/CommentItem";
import IssueReactions from "../components/IssueReactions";
import { useComment } from "../context/CommentContext";
import {
	formatTimeAgo,
	getCategoryIcon,
	getPriorityColor,
} from "../data/mockData";
import type { Issue } from "../types/database";

const { width, height } = Dimensions.get("window");

interface IssueDetailScreenProps {
	issue: Issue | null;
	visible: boolean;
	onClose: () => void;
	onNavigateToIssue: (issueId: string) => void;
	allIssues: Issue[];
}

export default function IssueDetailScreen({
	issue,
	visible,
	onClose,
	onNavigateToIssue,
	allIssues,
}: IssueDetailScreenProps) {
	const { getCommentsForIssue, commentsLoading, loadCommentsForIssue } =
		useComment();
	const [showCommentInput, setShowCommentInput] = useState(false);

	// Load comments when issue changes
	useEffect(() => {
		if (issue && visible) {
			loadCommentsForIssue(issue.id);
		}
	}, [issue?.id, visible, loadCommentsForIssue]);

	if (!issue) return null;

	const comments = getCommentsForIssue(issue.id);

	const currentIndex = allIssues.findIndex((i) => i.id === issue.id);
	const hasPrevious = currentIndex > 0;
	const hasNext = currentIndex < allIssues.length - 1;

	const handlePrevious = () => {
		if (hasPrevious) {
			onNavigateToIssue(allIssues[currentIndex - 1].id);
		}
	};

	const handleNext = () => {
		if (hasNext) {
			onNavigateToIssue(allIssues[currentIndex + 1].id);
		}
	};

	const priorityColor = getPriorityColor(issue.priority);
	const categoryIcon = getCategoryIcon(issue.category);

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="fullScreen"
			onRequestClose={onClose}
		>
			<View style={styles.container}>
				<StatusBar barStyle="light-content" backgroundColor="#000" />

				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity style={styles.closeButton} onPress={onClose}>
						<Ionicons name="close" size={24} color="#fff" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Issue Details</Text>
					<View style={styles.headerSpacer} />
				</View>

				<ScrollView
					style={styles.scrollView}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					{/* Issue Card */}
					<View style={styles.issueCard}>
						<View style={styles.cardHeader}>
							<View style={styles.categoryContainer}>
								<Ionicons name={categoryIcon as any} size={24} color="#000" />
								<View
									style={[
										styles.priorityDot,
										{ backgroundColor: priorityColor },
									]}
								/>
								<Text style={[styles.priorityText, { color: priorityColor }]}>
									{issue.priority.toUpperCase()}
								</Text>
							</View>
							<View style={styles.statusContainer}>
								<View
									style={[styles.statusDot, { backgroundColor: priorityColor }]}
								/>
								<Text style={[styles.statusText, { color: priorityColor }]}>
									{issue.status.replace("_", " ").toUpperCase()}
								</Text>
							</View>
						</View>

						<Text style={styles.issueTitle}>{issue.title}</Text>

						<Text style={styles.issueDescription}>{issue.description}</Text>

						{/* Issue Image */}
						{issue.image_url && (
							<Image
								source={{ uri: issue.image_url }}
								style={styles.issueImage}
								resizeMode="cover"
							/>
						)}

						<View style={styles.metaInfo}>
							<View style={styles.metaRow}>
								<Ionicons name="location-outline" size={16} color="#666" />
								<Text style={styles.metaText}>{issue.address}</Text>
							</View>

							<View style={styles.metaRow}>
								<Ionicons name="person-outline" size={16} color="#666" />
								<Text style={styles.metaText}>
									Reported by {issue.profiles?.name || "Anonymous"}
								</Text>
							</View>

							<View style={styles.metaRow}>
								<Ionicons name="time-outline" size={16} color="#666" />
								<Text style={styles.metaText}>
									{formatTimeAgo(issue.created_at)}
								</Text>
							</View>

							<View style={styles.metaRow}>
								<Ionicons name="thumbs-up-outline" size={16} color="#666" />
								<Text style={styles.metaText}>
									{issue.upvotes?.[0]?.count || 0} upvotes
								</Text>
							</View>
						</View>

						{/* Coordinates */}
						<View style={styles.coordinatesContainer}>
							<Text style={styles.coordinatesLabel}>Coordinates:</Text>
							<Text style={styles.coordinatesText}>
								{issue.latitude?.toFixed(6)}, {issue.longitude?.toFixed(6)}
							</Text>
						</View>
					</View>

					{/* Comments Section */}
					<View style={styles.commentsSection}>
						<View style={styles.commentsHeader}>
							<Text style={styles.commentsTitle}>
								Comments ({commentsLoading ? "..." : comments.length})
							</Text>
							<TouchableOpacity
								style={styles.addCommentButton}
								onPress={() => setShowCommentInput(!showCommentInput)}
							>
								<Ionicons name="add" size={20} color="#1DA1F2" />
								<Text style={styles.addCommentButtonText}>Add Comment</Text>
							</TouchableOpacity>
						</View>

						{showCommentInput && (
							<CommentInput
								issueId={issue.id}
								placeholder="Share your thoughts on this issue..."
								onCommentAdded={() => setShowCommentInput(false)}
							/>
						)}

						{commentsLoading ? (
							<View style={styles.noComments}>
								<Ionicons name="hourglass-outline" size={48} color="#ccc" />
								<Text style={styles.noCommentsText}>Loading comments...</Text>
							</View>
						) : comments.length === 0 ? (
							<View style={styles.noComments}>
								<Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
								<Text style={styles.noCommentsText}>No comments yet</Text>
								<Text style={styles.noCommentsSubtext}>
									Be the first to comment on this issue
								</Text>
							</View>
						) : (
							comments.map((comment) => (
								<CommentItem
									key={comment.id}
									comment={comment}
									issueId={issue.id}
								/>
							))
						)}
					</View>

					{/* Action Buttons */}
					<View style={styles.actionButtons}>
						<IssueReactions issueId={issue.id} />

						<TouchableOpacity style={styles.actionButton}>
							<Ionicons name="share-outline" size={20} color="#000" />
							<Text style={styles.actionButtonText}>Share</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>

				{/* Navigation Buttons */}
				<View style={styles.navigationContainer}>
					<TouchableOpacity
						style={[styles.navButton, !hasPrevious && styles.navButtonDisabled]}
						onPress={handlePrevious}
						disabled={!hasPrevious}
					>
						<Ionicons
							name="chevron-back"
							size={24}
							color={hasPrevious ? "#000" : "#ccc"}
						/>
						<Text
							style={[
								styles.navButtonText,
								!hasPrevious && styles.navButtonTextDisabled,
							]}
						>
							Previous
						</Text>
					</TouchableOpacity>

					<Text style={styles.navigationInfo}>
						{currentIndex + 1} of {allIssues.length}
					</Text>

					<TouchableOpacity
						style={[styles.navButton, !hasNext && styles.navButtonDisabled]}
						onPress={handleNext}
						disabled={!hasNext}
					>
						<Text
							style={[
								styles.navButtonText,
								!hasNext && styles.navButtonTextDisabled,
							]}
						>
							Next
						</Text>
						<Ionicons
							name="chevron-forward"
							size={24}
							color={hasNext ? "#000" : "#ccc"}
						/>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#ffffff",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingTop: 60,
		paddingBottom: 20,
		backgroundColor: "#000",
	},
	closeButton: {
		padding: 8,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#fff",
	},
	headerSpacer: {
		width: 40,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 20,
	},
	issueCard: {
		backgroundColor: "#ffffff",
		margin: 20,
		borderRadius: 12,
		padding: 20,
		borderWidth: 1,
		borderColor: "#f0f0f0",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	categoryContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	priorityDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		marginLeft: 8,
		marginRight: 8,
	},
	priorityText: {
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 0.5,
	},
	statusContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	statusDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: 6,
	},
	statusText: {
		fontSize: 12,
		fontWeight: "600",
		letterSpacing: 0.5,
	},
	issueTitle: {
		fontSize: 24,
		fontWeight: "700",
		color: "#000",
		marginBottom: 12,
		lineHeight: 30,
	},
	issueDescription: {
		fontSize: 16,
		color: "#333",
		lineHeight: 24,
		marginBottom: 20,
	},
	metaInfo: {
		backgroundColor: "#f8f9fa",
		borderRadius: 8,
		padding: 16,
		marginBottom: 16,
	},
	metaRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	metaText: {
		fontSize: 14,
		color: "#666",
		marginLeft: 8,
		flex: 1,
	},
	coordinatesContainer: {
		backgroundColor: "#f0f0f0",
		borderRadius: 6,
		padding: 12,
		marginBottom: 20,
	},
	coordinatesLabel: {
		fontSize: 12,
		color: "#999",
		fontWeight: "600",
		marginBottom: 4,
	},
	coordinatesText: {
		fontSize: 14,
		color: "#666",
		fontFamily: "monospace",
	},
	commentsSection: {
		margin: 20,
		marginTop: 0,
	},
	commentsHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	commentsTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#000",
	},
	addCommentButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f0f8ff",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#1DA1F2",
	},
	addCommentButtonText: {
		fontSize: 14,
		color: "#1DA1F2",
		fontWeight: "600",
		marginLeft: 4,
	},
	noComments: {
		alignItems: "center",
		paddingVertical: 40,
	},
	noCommentsText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#999",
		marginTop: 12,
	},
	noCommentsSubtext: {
		fontSize: 14,
		color: "#ccc",
		marginTop: 4,
	},
	actionButtons: {
		flexDirection: "row",
		justifyContent: "space-around",
		paddingHorizontal: 20,
		paddingVertical: 20,
		borderTopWidth: 1,
		borderTopColor: "#f0f0f0",
	},
	actionButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 20,
		backgroundColor: "#f8f9fa",
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	actionButtonText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#000",
		marginLeft: 6,
	},
	navigationContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 16,
		backgroundColor: "#f8f9fa",
		borderTopWidth: 1,
		borderTopColor: "#e0e0e0",
	},
	navButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		paddingHorizontal: 16,
		backgroundColor: "#ffffff",
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	navButtonDisabled: {
		backgroundColor: "#f8f9fa",
	},
	navButtonText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#000",
		marginHorizontal: 4,
	},
	navButtonTextDisabled: {
		color: "#ccc",
	},
	navigationInfo: {
		fontSize: 14,
		fontWeight: "600",
		color: "#666",
	},
	issueImage: {
		width: "100%",
		height: 250,
		borderRadius: 8,
		marginVertical: 16,
		backgroundColor: "#f0f0f0",
	},
});
