import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import {
	Alert,
	Dimensions,
	Image,
	Modal,
	ScrollView,
	Share,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useBookmark } from "../context/BookmarkContext";
import {
	formatTimeAgo,
	getCategoryIcon,
	getPriorityColor,
	getStatusColor,
} from "../data/mockData";
import { DataService } from "../services/dataService";
import type { Issue } from "../types/database";
import IssueDetailScreen from "./IssueDetailScreen";

const { width } = Dimensions.get("window");

interface SearchResultsScreenProps {
	navigation: any;
	route: any;
}

export default function SearchResultsScreen({
	navigation,
	route,
}: SearchResultsScreenProps) {
	const { searchQuery: initialQuery = "" } = route.params || {};
	const { user } = useAuth();
	const { isBookmarked, toggleBookmark } = useBookmark();
	const [searchQuery, setSearchQuery] = useState(initialQuery);
	const [selectedIssue, setSelectedIssue] = useState<any>(null);
	const [showDetailModal, setShowDetailModal] = useState(false);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [issues, setIssues] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeMenu, setActiveMenu] = useState<string | null>(null);
	const [editingIssue, setEditingIssue] = useState<any>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editTitle, setEditTitle] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [filters, setFilters] = useState({
		status: "all" as "all" | "pending" | "in_progress" | "resolved",
		category: "all" as
			| "all"
			| "infrastructure"
			| "safety"
			| "environment"
			| "maintenance"
			| "accessibility"
			| "road_maintenance",
		author: "",
		dateFrom: "",
		dateTo: "",
		reportedAt: "all" as "all" | "today" | "week" | "month" | "year",
	});

	useEffect(() => {
		loadIssues();
	}, []);

	const loadIssues = async () => {
		try {
			setLoading(true);
			const issuesData = await DataService.getIssues();
			setIssues(issuesData);
		} catch (error) {
			console.error("Error loading issues:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleIssuePress = (issue: Issue) => {
		setSelectedIssue(issue);
		setShowDetailModal(true);
	};

	const handleCloseDetail = () => {
		setShowDetailModal(false);
		setSelectedIssue(null);
	};

	// Get the current filtered results for navigation
	const getCurrentFilteredResults = () => {
		const exactResults = getFilteredResults();
		const similarResults = getSimilarResults();
		return exactResults.length > 0 ? exactResults : similarResults;
	};

	const handleNavigateToIssue = (issueId: string) => {
		const currentResults = getCurrentFilteredResults();
		const issue = currentResults.find((i) => i.id === issueId);
		if (issue) {
			setSelectedIssue(issue);
		}
	};

	const handleMenuPress = (issueId: string) => {
		setActiveMenu(activeMenu === issueId ? null : issueId);
	};

	const handleBookmarkPress = (issueId: string) => {
		toggleBookmark(issueId);
	};

	const handleMenuAction = async (action: string, issue: any) => {
		setActiveMenu(null);

		switch (action) {
			case "share":
				try {
					const shareContent = {
						title: "Jamaica Issue Report",
						message: `Check out this issue in Jamaica: "${issue.title}"\n\n${issue.description}\n\nLocation: ${issue.address}`,
						url: `jamaicaissues://issue/${issue.id}`, // Deep link format
					};

					await Share.share(shareContent);
				} catch (error) {
					console.error("Error sharing issue:", error);
					Alert.alert("Error", "Failed to share issue. Please try again.");
				}
				break;

			case "report":
				Alert.alert("Report Issue", "Report this issue as inappropriate?", [
					{ text: "Cancel", style: "cancel" },
					{
						text: "Report",
						style: "destructive",
						onPress: () => console.log("Report functionality would go here"),
					},
				]);
				break;

			case "copy_link":
				try {
					const issueLink = `jamaicaissues://issue/${issue.id}`;
					await Clipboard.setStringAsync(issueLink);
					Alert.alert("Link Copied", "Issue link copied to clipboard");
				} catch (error) {
					console.error("Error copying link:", error);
					Alert.alert("Error", "Failed to copy link. Please try again.");
				}
				break;

			case "view_location":
				navigation.navigate("Map", {
					issueId: issue.id,
					latitude: issue.latitude,
					longitude: issue.longitude,
				});
				break;

			case "edit":
				if (user?.id === issue.reported_by) {
					setEditingIssue(issue);
					setEditTitle(issue.title);
					setEditDescription(issue.description);
					setShowEditModal(true);
				}
				break;

			case "delete":
				if (user?.id === issue.reported_by) {
					Alert.alert(
						"Delete Issue",
						"Are you sure you want to delete this issue? This action cannot be undone.",
						[
							{ text: "Cancel", style: "cancel" },
							{
								text: "Delete",
								style: "destructive",
								onPress: () => handleDeleteIssue(issue.id),
							},
						],
					);
				}
				break;
		}
	};

	const handleDeleteIssue = async (issueId: string) => {
		try {
			await DataService.deleteIssue(issueId);
			setIssues((prevIssues) =>
				prevIssues.filter((issue) => issue.id !== issueId),
			);
			Alert.alert("Success", "Issue deleted successfully");
		} catch (error) {
			console.error("Error deleting issue:", error);
			Alert.alert("Error", "Failed to delete issue. Please try again.");
		}
	};

	const handleEditIssue = async () => {
		if (!editingIssue || !editTitle.trim() || !editDescription.trim()) {
			Alert.alert("Error", "Please fill in all fields");
			return;
		}

		try {
			const updates = {
				title: editTitle.trim(),
				description: editDescription.trim(),
				updated_at: new Date().toISOString(),
			};

			await DataService.updateIssue(editingIssue.id, updates);

			setIssues((prevIssues) =>
				prevIssues.map((issue) =>
					issue.id === editingIssue.id ? { ...issue, ...updates } : issue,
				),
			);

			setShowEditModal(false);
			setEditingIssue(null);
			setEditTitle("");
			setEditDescription("");

			Alert.alert("Success", "Issue updated successfully");
		} catch (error) {
			console.error("Error updating issue:", error);
			Alert.alert("Error", "Failed to update issue. Please try again.");
		}
	};

	const handleCancelEdit = () => {
		setShowEditModal(false);
		setEditingIssue(null);
		setEditTitle("");
		setEditDescription("");
	};

	const applyFilters = () => {
		setShowFilterModal(false);
	};

	const clearFilters = () => {
		setFilters({
			status: "all",
			category: "all",
			author: "",
			dateFrom: "",
			dateTo: "",
			reportedAt: "all",
		});
	};

	const getFilteredResults = () => {
		let results = issues;

		// Text search
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			results = results.filter(
				(issue) =>
					issue.title.toLowerCase().includes(query) ||
					issue.description.toLowerCase().includes(query) ||
					issue.address.toLowerCase().includes(query) ||
					(issue.profiles?.name || "").toLowerCase().includes(query),
			);
		}

		// Status filter
		if (filters.status !== "all") {
			results = results.filter((issue) => issue.status === filters.status);
		}

		// Category filter
		if (filters.category !== "all") {
			results = results.filter((issue) => issue.category === filters.category);
		}

		// Author filter
		if (filters.author.trim()) {
			const authorQuery = filters.author.toLowerCase();
			results = results.filter((issue) =>
				(issue.profiles?.name || "").toLowerCase().includes(authorQuery),
			);
		}

		// Date filters
		if (filters.dateFrom) {
			const fromDate = new Date(filters.dateFrom);
			results = results.filter(
				(issue) => new Date(issue.created_at) >= fromDate,
			);
		}

		if (filters.dateTo) {
			const toDate = new Date(filters.dateTo);
			toDate.setHours(23, 59, 59, 999); // End of day
			results = results.filter((issue) => new Date(issue.created_at) <= toDate);
		}

		// Reported at filter
		const now = new Date();
		if (filters.reportedAt === "today") {
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			results = results.filter((issue) => new Date(issue.created_at) >= today);
		} else if (filters.reportedAt === "week") {
			const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			results = results.filter(
				(issue) => new Date(issue.created_at) >= weekAgo,
			);
		} else if (filters.reportedAt === "month") {
			const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
			results = results.filter(
				(issue) => new Date(issue.created_at) >= monthAgo,
			);
		} else if (filters.reportedAt === "year") {
			const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
			results = results.filter(
				(issue) => new Date(issue.created_at) >= yearAgo,
			);
		}

		return results;
	};

	const getSimilarResults = () => {
		const exactResults = getFilteredResults();
		if (exactResults.length > 0) return [];

		// If no exact results, find similar ones
		let similarResults = issues;

		// Try partial matches for text search
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			const words = query.split(" ").filter((word: string) => word.length > 2);

			similarResults = similarResults.filter((issue) => {
				const searchableText = [
					issue.title,
					issue.description,
					issue.address,
					issue.profiles?.name || "",
				]
					.join(" ")
					.toLowerCase();

				return words.some((word: string) => searchableText.includes(word));
			});
		}

		// Apply other filters with more lenient matching
		if (filters.status !== "all") {
			similarResults = similarResults.filter(
				(issue) =>
					issue.status === filters.status ||
					(filters.status === "pending" && issue.status === "in_progress") ||
					(filters.status === "in_progress" && issue.status === "pending"),
			);
		}

		if (filters.category !== "all") {
			similarResults = similarResults.filter(
				(issue) =>
					issue.category === filters.category ||
					(filters.category === "infrastructure" &&
						issue.category === "maintenance") ||
					(filters.category === "infrastructure" &&
						issue.category === "road_maintenance") ||
					(filters.category === "safety" &&
						issue.category === "infrastructure"),
			);
		}

		return similarResults.slice(0, 10); // Limit to 10 similar results
	};

	const exactResults = getFilteredResults();
	const similarResults = getSimilarResults();
	const hasActiveFilters = Object.values(filters).some(
		(value) => value !== "all" && value !== "",
	);

	const renderIssue = (item: any) => {
		const priorityColor = getPriorityColor(item.priority);
		const statusColor = getStatusColor(item.status);
		const upvoteCount = item.upvotes?.[0]?.count || 0;
		const commentCount = item.comments?.[0]?.count || 0;
		const authorName = item.profiles?.name || "Unknown User";
		const authorAvatar = item.profiles?.avatar;

		return (
			<View key={item.id} style={styles.postCard}>
				{/* Post Header */}
				<View style={styles.postHeader}>
					<View style={styles.authorInfo}>
						<View style={styles.avatarContainer}>
							{authorAvatar ? (
								<Image source={{ uri: authorAvatar }} style={styles.avatar} />
							) : (
								<View style={styles.defaultAvatar}>
									<Text style={styles.defaultAvatarText}>
										{authorName.charAt(0).toUpperCase()}
									</Text>
								</View>
							)}
						</View>
						<View style={styles.authorDetails}>
							<View style={styles.authorNameRow}>
								<Text style={styles.authorName}>{authorName}</Text>
							</View>
							<Text style={styles.postTime}>
								{formatTimeAgo(item.created_at)}
							</Text>
						</View>
					</View>
					<View style={styles.headerActions}>
						<TouchableOpacity
							style={styles.bookmarkButton}
							onPress={() => handleBookmarkPress(item.id)}
							activeOpacity={0.7}
						>
							<Ionicons
								name={isBookmarked(item.id) ? "bookmark" : "bookmark-outline"}
								size={24}
								color={isBookmarked(item.id) ? "#FFD700" : "#000"}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.moreButton}
							onPress={() => handleMenuPress(item.id)}
							activeOpacity={0.7}
						>
							<Ionicons name="ellipsis-horizontal" size={20} color="#000" />
						</TouchableOpacity>
					</View>
				</View>

				{/* Dropdown Menu */}
				{activeMenu === item.id && (
					<View style={styles.dropdownMenu}>
						<TouchableOpacity
							style={styles.menuItem}
							onPress={() => handleMenuAction("share", item)}
						>
							<Ionicons name="share-outline" size={20} color="#333" />
							<Text style={styles.menuItemText}>Share Issue</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.menuItem}
							onPress={() => handleMenuAction("copy_link", item)}
						>
							<Ionicons name="link-outline" size={20} color="#333" />
							<Text style={styles.menuItemText}>Copy Link</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.menuItem}
							onPress={() => handleMenuAction("view_location", item)}
						>
							<Ionicons name="location-outline" size={20} color="#333" />
							<Text style={styles.menuItemText}>View on Map</Text>
						</TouchableOpacity>

						{user?.id === item.reported_by && (
							<>
								<View style={styles.menuDivider} />
								<TouchableOpacity
									style={styles.menuItem}
									onPress={() => handleMenuAction("edit", item)}
								>
									<Ionicons name="create-outline" size={20} color="#333" />
									<Text style={styles.menuItemText}>Edit Issue</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={styles.menuItem}
									onPress={() => handleMenuAction("delete", item)}
								>
									<Ionicons name="trash-outline" size={20} color="#dc3545" />
									<Text style={[styles.menuItemText, { color: "#dc3545" }]}>
										Delete Issue
									</Text>
								</TouchableOpacity>
							</>
						)}

						{user?.id !== item.reported_by && (
							<>
								<View style={styles.menuDivider} />
								<TouchableOpacity
									style={styles.menuItem}
									onPress={() => handleMenuAction("report", item)}
								>
									<Ionicons name="flag-outline" size={20} color="#dc3545" />
									<Text style={[styles.menuItemText, { color: "#dc3545" }]}>
										Report Issue
									</Text>
								</TouchableOpacity>
							</>
						)}
					</View>
				)}

				{/* Post Content */}
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={() => handleIssuePress(item)}
				>
					<Text style={styles.postTitle}>{item.title}</Text>
					<Text style={styles.postText}>{item.description}</Text>

					{/* Image */}
					{item.image_url && (
						<Image
							source={{ uri: item.image_url }}
							style={styles.postImage}
							resizeMode="cover"
						/>
					)}
				</TouchableOpacity>

				{/* Post Footer */}
				<View style={styles.postFooter}>
					<View style={styles.engagementRow}>
						<TouchableOpacity style={styles.engagementButton}>
							<Ionicons name="heart-outline" size={24} color="#000" />
							<Text style={styles.engagementText}>{upvoteCount}</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.engagementButton}
							onPress={() => handleIssuePress(item)}
						>
							<Ionicons name="chatbubble-outline" size={24} color="#000" />
							<Text style={styles.engagementText}>{commentCount}</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.statusRow}>
						<View
							style={[styles.statusBadge, { backgroundColor: statusColor }]}
						>
							<Text style={styles.statusBadgeText}>
								{item.status.replace("_", " ")}
							</Text>
						</View>
						<View
							style={[styles.priorityBadge, { backgroundColor: priorityColor }]}
						>
							<Text style={styles.priorityBadgeText}>{item.priority}</Text>
						</View>
					</View>
				</View>

				{/* Location */}
				<View style={styles.locationRow}>
					<Ionicons name="location-outline" size={14} color="#666" />
					<Text style={styles.locationText} numberOfLines={1}>
						{item.address}
					</Text>
				</View>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<StatusBar
				barStyle="dark-content"
				backgroundColor="transparent"
				translucent
			/>

			<TouchableOpacity
				style={styles.container}
				activeOpacity={1}
				onPress={() => setActiveMenu(null)}
			>
				{/* Header */}
				<View style={styles.header}>
					<View style={styles.searchBarContainer}>
						<Ionicons
							name="search-outline"
							size={20}
							color="#666"
							style={styles.searchIcon}
						/>
						<TextInput
							style={styles.searchInput}
							placeholder="Search issues, locations, hashtags..."
							value={searchQuery}
							onChangeText={setSearchQuery}
							autoFocus={true}
							returnKeyType="search"
						/>
						{searchQuery.length > 0 && (
							<TouchableOpacity
								onPress={() => setSearchQuery("")}
								style={styles.clearSearchButton}
							>
								<Ionicons name="close-circle" size={20} color="#666" />
							</TouchableOpacity>
						)}
					</View>

					<TouchableOpacity
						style={styles.filterButton}
						onPress={() => setShowFilterModal(true)}
					>
						<Ionicons name="options-outline" size={24} color="#000" />
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => navigation.goBack()}
						style={styles.cancelButton}
					>
						<Text style={styles.cancelText}>Cancel</Text>
					</TouchableOpacity>
				</View>

				{/* Results */}
				<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
					{loading ? (
						<View style={styles.noResultsContainer}>
							<Ionicons name="hourglass-outline" size={60} color="#ccc" />
							<Text style={styles.noResultsText}>Loading issues...</Text>
						</View>
					) : exactResults.length === 0 && similarResults.length === 0 ? (
						<View style={styles.noResultsContainer}>
							<Ionicons name="search-outline" size={60} color="#ccc" />
							<Text style={styles.noResultsText}>No issues found</Text>
							<Text style={styles.noResultsSubtext}>
								Try searching for different keywords or check your spelling
							</Text>
						</View>
					) : (
						<View>
							{exactResults.length > 0 && (
								<View>
									<View style={styles.sectionHeader}>
										<Ionicons name="search-outline" size={20} color="#000" />
										<Text style={styles.sectionTitle}>
											{exactResults.length} result
											{exactResults.length !== 1 ? "s" : ""} found
										</Text>
									</View>
									<View style={styles.resultsList}>
										{exactResults.map((issue) => renderIssue(issue))}
									</View>
								</View>
							)}

							{exactResults.length === 0 && similarResults.length > 0 && (
								<View>
									<View style={styles.sectionHeader}>
										<Ionicons name="search-outline" size={20} color="#000" />
										<Text style={styles.sectionTitle}>
											No exact matches found
										</Text>
									</View>
									<View style={styles.similarResultsHeader}>
										<Text style={styles.similarResultsText}>
											Similar results:
										</Text>
									</View>
									<View style={styles.resultsList}>
										{similarResults.map((issue) => renderIssue(issue))}
									</View>
								</View>
							)}
						</View>
					)}
				</ScrollView>

				{/* Issue Detail Modal */}
				<IssueDetailScreen
					issue={selectedIssue}
					visible={showDetailModal}
					onClose={handleCloseDetail}
					onNavigateToIssue={handleNavigateToIssue}
					allIssues={getCurrentFilteredResults()}
				/>

				{/* Filter Modal */}
				<Modal
					visible={showFilterModal}
					animationType="slide"
					presentationStyle="pageSheet"
					onRequestClose={() => setShowFilterModal(false)}
				>
					<View style={styles.filterContainer}>
						<View style={styles.filterHeader}>
							<Text style={styles.filterTitle}>Filter Results</Text>
							<TouchableOpacity onPress={() => setShowFilterModal(false)}>
								<Ionicons name="close" size={24} color="#000" />
							</TouchableOpacity>
						</View>

						<ScrollView
							style={styles.filterContent}
							showsVerticalScrollIndicator={false}
						>
							{/* Status Filter */}
							<View style={styles.filterSection}>
								<Text style={styles.filterSectionTitle}>Status</Text>
								<View style={styles.filterButtonsGrid}>
									{[
										{ key: "all", label: "All" },
										{ key: "pending", label: "Pending" },
										{ key: "in_progress", label: "In Progress" },
										{ key: "resolved", label: "Resolved" },
									].map(({ key, label }) => (
										<TouchableOpacity
											key={key}
											style={[
												styles.filterButton,
												filters.status === key && styles.filterButtonActive,
											]}
											onPress={() =>
												setFilters((prev) => ({ ...prev, status: key as any }))
											}
										>
											<Text
												style={[
													styles.filterButtonText,
													filters.status === key &&
														styles.filterButtonTextActive,
												]}
											>
												{label}
											</Text>
										</TouchableOpacity>
									))}
								</View>
							</View>

							{/* Category Filter */}
							<View style={styles.filterSection}>
								<Text style={styles.filterSectionTitle}>Category</Text>
								<View style={styles.filterButtonsGrid}>
									{[
										{ key: "all", label: "All" },
										{ key: "infrastructure", label: "Infrastructure" },
										{ key: "road_maintenance", label: "Road Maintenance" },
										{ key: "safety", label: "Safety" },
										{ key: "environment", label: "Environment" },
										{ key: "maintenance", label: "Maintenance" },
										{ key: "accessibility", label: "Accessibility" },
									].map(({ key, label }) => (
										<TouchableOpacity
											key={key}
											style={[
												styles.filterButton,
												filters.category === key && styles.filterButtonActive,
											]}
											onPress={() =>
												setFilters((prev) => ({
													...prev,
													category: key as any,
												}))
											}
										>
											<Text
												style={[
													styles.filterButtonText,
													filters.category === key &&
														styles.filterButtonTextActive,
												]}
											>
												{label}
											</Text>
										</TouchableOpacity>
									))}
								</View>
							</View>

							{/* Author Filter */}
							<View style={styles.filterSection}>
								<Text style={styles.filterSectionTitle}>Author Name</Text>
								<TextInput
									style={styles.textInput}
									placeholder="Enter author name..."
									value={filters.author}
									onChangeText={(text) =>
										setFilters((prev) => ({ ...prev, author: text }))
									}
								/>
							</View>

							{/* Date Range Filter */}
							<View style={styles.filterSection}>
								<Text style={styles.filterSectionTitle}>Date Range</Text>
								<View style={styles.dateInputsRow}>
									<View style={styles.dateInputContainer}>
										<Text style={styles.dateLabel}>From</Text>
										<TextInput
											style={styles.dateInput}
											placeholder="YYYY-MM-DD"
											value={filters.dateFrom}
											onChangeText={(text) =>
												setFilters((prev) => ({ ...prev, dateFrom: text }))
											}
										/>
									</View>
									<View style={styles.dateInputContainer}>
										<Text style={styles.dateLabel}>To</Text>
										<TextInput
											style={styles.dateInput}
											placeholder="YYYY-MM-DD"
											value={filters.dateTo}
											onChangeText={(text) =>
												setFilters((prev) => ({ ...prev, dateTo: text }))
											}
										/>
									</View>
								</View>
							</View>

							{/* Reported At Filter */}
							<View style={styles.filterSection}>
								<Text style={styles.filterSectionTitle}>Reported</Text>
								<View style={styles.filterButtonsGrid}>
									{[
										{ key: "all", label: "All Time" },
										{ key: "today", label: "Today" },
										{ key: "week", label: "This Week" },
										{ key: "month", label: "This Month" },
										{ key: "year", label: "This Year" },
									].map(({ key, label }) => (
										<TouchableOpacity
											key={key}
											style={[
												styles.filterButton,
												filters.reportedAt === key && styles.filterButtonActive,
											]}
											onPress={() =>
												setFilters((prev) => ({
													...prev,
													reportedAt: key as any,
												}))
											}
										>
											<Text
												style={[
													styles.filterButtonText,
													filters.reportedAt === key &&
														styles.filterButtonTextActive,
												]}
											>
												{label}
											</Text>
										</TouchableOpacity>
									))}
								</View>
							</View>
						</ScrollView>

						<View style={styles.filterFooter}>
							<TouchableOpacity
								style={styles.clearFiltersButton}
								onPress={clearFilters}
							>
								<Ionicons name="refresh-outline" size={20} color="#666" />
								<Text style={styles.clearFiltersText}>Clear All</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.applyFiltersButton}
								onPress={applyFilters}
							>
								<Text style={styles.applyFiltersText}>Apply Filters</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>

				{/* Edit Issue Modal */}
				<Modal
					visible={showEditModal}
					animationType="slide"
					presentationStyle="pageSheet"
					onRequestClose={handleCancelEdit}
				>
					<View style={styles.editModalContainer}>
						<View style={styles.editModalHeader}>
							<TouchableOpacity onPress={handleCancelEdit}>
								<Text style={styles.editModalCancelText}>Cancel</Text>
							</TouchableOpacity>
							<Text style={styles.editModalTitle}>Edit Issue</Text>
							<TouchableOpacity onPress={handleEditIssue}>
								<Text style={styles.editModalSaveText}>Save</Text>
							</TouchableOpacity>
						</View>

						<ScrollView
							style={styles.editModalContent}
							showsVerticalScrollIndicator={false}
						>
							<View style={styles.editFormSection}>
								<Text style={styles.editFormLabel}>Title</Text>
								<TextInput
									style={styles.editFormInput}
									value={editTitle}
									onChangeText={setEditTitle}
									placeholder="Issue title"
									maxLength={100}
									multiline
								/>
							</View>

							<View style={styles.editFormSection}>
								<Text style={styles.editFormLabel}>Description</Text>
								<TextInput
									style={[styles.editFormInput, styles.editFormTextArea]}
									value={editDescription}
									onChangeText={setEditDescription}
									placeholder="Describe the issue in detail"
									maxLength={500}
									multiline
									numberOfLines={6}
								/>
							</View>

							<View style={styles.editFormInfo}>
								<Text style={styles.editFormInfoText}>
									Note: Location, category, and priority cannot be changed after
									posting.
								</Text>
							</View>
						</ScrollView>
					</View>
				</Modal>
			</TouchableOpacity>
		</View>
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
		paddingHorizontal: 16,
		paddingTop: 60,
		paddingBottom: 16,
		backgroundColor: "#ffffff",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	searchBarContainer: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f8f9fa",
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 12,
		marginRight: 12,
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		color: "#000",
	},
	clearSearchButton: {
		marginLeft: 8,
	},
	filterButton: {
		padding: 8,
		marginRight: 12,
	},
	cancelButton: {
		paddingVertical: 8,
	},
	cancelText: {
		fontSize: 16,
		color: "#1DA1F2",
		fontWeight: "500",
	},
	content: {
		flex: 1,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 16,
		backgroundColor: "#f8f9fa",
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#000",
		marginLeft: 8,
	},
	similarResultsHeader: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: "#f8f9fa",
	},
	similarResultsText: {
		fontSize: 14,
		color: "#666",
		fontStyle: "italic",
	},
	resultsList: {
		paddingHorizontal: 16,
		paddingBottom: 20,
	},
	noResultsContainer: {
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
		paddingVertical: 60,
	},
	noResultsText: {
		fontSize: 18,
		fontWeight: "600",
		color: "#000",
		textAlign: "center",
		marginTop: 16,
		marginBottom: 8,
	},
	noResultsSubtext: {
		fontSize: 14,
		color: "#666",
		textAlign: "center",
		lineHeight: 20,
	},
	// Post Card Styles (reused from HomeScreen)
	postCard: {
		backgroundColor: "#ffffff",
		marginBottom: 16,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 4,
		elevation: 2,
		borderWidth: 1,
		borderColor: "rgba(0, 0, 0, 0.04)",
	},
	postHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	authorInfo: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	avatarContainer: {
		marginRight: 12,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
	},
	defaultAvatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#e0e0e0",
		justifyContent: "center",
		alignItems: "center",
	},
	defaultAvatarText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#666",
	},
	authorDetails: {
		flex: 1,
	},
	authorNameRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	authorName: {
		fontSize: 14,
		fontWeight: "600",
		color: "#000",
		marginRight: 4,
	},
	postTime: {
		fontSize: 12,
		color: "#666",
		marginTop: 2,
	},
	moreButton: {
		padding: 8,
	},
	postTitle: {
		fontSize: 17,
		fontWeight: "700",
		color: "#1a1a1a",
		lineHeight: 24,
		paddingHorizontal: 16,
		marginBottom: 8,
		letterSpacing: -0.2,
	},
	postText: {
		fontSize: 15,
		color: "#333",
		lineHeight: 22,
		paddingHorizontal: 16,
		paddingBottom: 16,
		fontWeight: "400",
	},
	postImage: {
		width: "100%",
		height: 250,
		marginBottom: 12,
	},
	hashtagsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		paddingHorizontal: 16,
		paddingBottom: 12,
	},
	hashtag: {
		fontSize: 14,
		color: "#1DA1F2",
		marginRight: 8,
		marginBottom: 4,
	},
	postFooter: {
		paddingHorizontal: 16,
		paddingBottom: 16,
		paddingTop: 4,
	},
	engagementRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-start",
		marginBottom: 12,
		marginTop: 4,
	},
	engagementButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 8,
		paddingVertical: 6,
		marginRight: 24,
		borderRadius: 16,
		backgroundColor: "rgba(0, 0, 0, 0.02)",
		minWidth: 50,
		justifyContent: "center",
	},
	engagementText: {
		fontSize: 14,
		color: "#333",
		marginLeft: 8,
		fontWeight: "600",
		minWidth: 20,
		textAlign: "center",
	},
	statusRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginTop: 8,
		marginBottom: 4,
		paddingHorizontal: 16,
	},
	statusBadge: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 3,
		elevation: 2,
		minWidth: 70,
		alignItems: "center",
		justifyContent: "center",
	},
	statusBadgeText: {
		fontSize: 12,
		fontWeight: "700",
		color: "#fff",
		textTransform: "capitalize",
		letterSpacing: 0.4,
		textAlign: "center",
	},
	priorityBadge: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 3,
		elevation: 2,
		minWidth: 70,
		alignItems: "center",
		justifyContent: "center",
	},
	priorityBadgeText: {
		fontSize: 12,
		fontWeight: "700",
		color: "#fff",
		textTransform: "capitalize",
		letterSpacing: 0.4,
		textAlign: "center",
	},
	locationRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingBottom: 16,
		paddingTop: 4,
		backgroundColor: "rgba(0, 0, 0, 0.01)",
		borderBottomLeftRadius: 12,
		borderBottomRightRadius: 12,
	},
	locationText: {
		fontSize: 12,
		color: "#666",
		marginLeft: 6,
		flex: 1,
		fontWeight: "500",
	},
	// Filter Modal Styles
	filterContainer: {
		flex: 1,
		backgroundColor: "#ffffff",
	},
	filterHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	filterTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#000",
	},
	filterContent: {
		flex: 1,
		paddingHorizontal: 20,
	},
	filterSection: {
		marginVertical: 20,
	},
	filterSectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#000",
		marginBottom: 12,
	},
	filterButtonsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	filterButton: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 20,
		backgroundColor: "#f8f9fa",
		borderWidth: 1,
		borderColor: "#e0e0e0",
		minWidth: 80,
		alignItems: "center",
	},
	filterButtonActive: {
		backgroundColor: "#000",
		borderColor: "#000",
	},
	filterButtonText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#666",
	},
	filterButtonTextActive: {
		color: "#fff",
	},
	textInput: {
		borderWidth: 1,
		borderColor: "#e0e0e0",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontSize: 16,
		backgroundColor: "#f8f9fa",
	},
	dateInputsRow: {
		flexDirection: "row",
		gap: 12,
	},
	dateInputContainer: {
		flex: 1,
	},
	dateLabel: {
		fontSize: 14,
		fontWeight: "500",
		color: "#666",
		marginBottom: 4,
	},
	dateInput: {
		borderWidth: 1,
		borderColor: "#e0e0e0",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontSize: 16,
		backgroundColor: "#f8f9fa",
	},
	filterFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 20,
		borderTopWidth: 1,
		borderTopColor: "#f0f0f0",
		gap: 12,
	},
	clearFiltersButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 20,
		backgroundColor: "#f8f9fa",
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "#e0e0e0",
		flex: 1,
		justifyContent: "center",
	},
	clearFiltersText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#666",
		marginLeft: 6,
	},
	applyFiltersButton: {
		paddingVertical: 12,
		paddingHorizontal: 20,
		backgroundColor: "#000",
		borderRadius: 20,
		flex: 1,
		alignItems: "center",
	},
	applyFiltersText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#fff",
	},
	// Header Actions Styles
	headerActions: {
		flexDirection: "row",
		alignItems: "center",
	},
	bookmarkButton: {
		padding: 8,
		marginRight: 8,
	},
	// Dropdown Menu Styles
	dropdownMenu: {
		position: "absolute",
		top: 60,
		right: 16,
		backgroundColor: "#ffffff",
		borderRadius: 8,
		padding: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 8,
		zIndex: 1000,
		minWidth: 160,
		borderWidth: 1,
		borderColor: "#f0f0f0",
	},
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 12,
		borderRadius: 6,
	},
	menuItemText: {
		fontSize: 15,
		color: "#333",
		marginLeft: 12,
		fontWeight: "500",
	},
	menuDivider: {
		height: 1,
		backgroundColor: "#f0f0f0",
		marginVertical: 4,
		marginHorizontal: 8,
	},
	// Edit Modal Styles
	editModalContainer: {
		flex: 1,
		backgroundColor: "#ffffff",
	},
	editModalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 16,
		paddingTop: 60,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
		backgroundColor: "#ffffff",
	},
	editModalTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#000",
	},
	editModalCancelText: {
		fontSize: 16,
		color: "#666",
		fontWeight: "500",
	},
	editModalSaveText: {
		fontSize: 16,
		color: "#1DA1F2",
		fontWeight: "600",
	},
	editModalContent: {
		flex: 1,
		padding: 20,
	},
	editFormSection: {
		marginBottom: 24,
	},
	editFormLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: "#000",
		marginBottom: 8,
	},
	editFormInput: {
		borderWidth: 1,
		borderColor: "#e0e0e0",
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		backgroundColor: "#f8f9fa",
		color: "#000",
	},
	editFormTextArea: {
		height: 120,
		textAlignVertical: "top",
	},
	editFormInfo: {
		backgroundColor: "#f0f8ff",
		padding: 16,
		borderRadius: 8,
		borderLeftWidth: 4,
		borderLeftColor: "#1DA1F2",
	},
	editFormInfoText: {
		fontSize: 14,
		color: "#666",
		lineHeight: 20,
	},
});
