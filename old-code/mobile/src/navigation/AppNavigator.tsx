import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { BookmarkProvider } from "../context/BookmarkContext";
import { CommentProvider } from "../context/CommentContext";
import BookmarksScreen from "../screens/BookmarksScreen";
import HomeScreen from "../screens/HomeScreen";
import IssueDetailWrapper from "../screens/IssueDetailWrapper";
import LoginScreen from "../screens/LoginScreen";
import MapScreen from "../screens/MapScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ReportScreen from "../screens/ReportScreen";
import SearchResultsScreen from "../screens/SearchResultsScreen";
import UserCommentsScreen from "../screens/UserCommentsScreen";

export type RootStackParamList = {
	Auth: undefined;
	Main: undefined;
	SearchResults: { searchQuery?: string };
	Bookmarks: undefined;
	UserComments: undefined;
	IssueDetail: { issueId: string };
};

export type MainTabParamList = {
	Home: undefined;
	Map: { issueId?: string; latitude?: number; longitude?: number } | undefined;
	Report: undefined;
	Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
	const insets = useSafeAreaInsets();

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused, color, size }) => {
					let iconName: keyof typeof Ionicons.glyphMap;

					if (route.name === "Home") {
						iconName = focused ? "home" : "home-outline";
					} else if (route.name === "Map") {
						iconName = focused ? "map" : "map-outline";
					} else if (route.name === "Report") {
						iconName = focused ? "add-circle" : "add-circle-outline";
					} else if (route.name === "Profile") {
						iconName = focused ? "person" : "person-outline";
					} else {
						iconName = "help-outline";
					}

					return <Ionicons name={iconName} size={size} color={color} />;
				},
				tabBarActiveTintColor: "#000",
				tabBarInactiveTintColor: "#666",
				tabBarStyle: {
					backgroundColor: "rgba(255, 255, 255, 0.95)",
					borderTopWidth: 1,
					borderTopColor: "#e0e0e0",
					paddingBottom: Math.max(insets.bottom, 8),
					paddingTop: 8,
					height: 65 + Math.max(insets.bottom, 0),
					position: "absolute",
					bottom: 0,
					left: 0,
					right: 0,
					elevation: 8, // Android shadow
					shadowColor: "#000", // iOS shadow
					shadowOffset: { width: 0, height: -2 },
					shadowOpacity: 0.1,
					shadowRadius: 4,
				},
				headerShown: false,
			})}
		>
			<Tab.Screen name="Home" component={HomeScreen} />
			<Tab.Screen name="Map" component={MapScreen} />
			<Tab.Screen name="Report" component={ReportScreen} />
			<Tab.Screen name="Profile" component={ProfileScreen} />
		</Tab.Navigator>
	);
}

function AppNavigatorInner() {
	const { isAuthenticated } = useAuth();

	return (
		<NavigationContainer>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				{isAuthenticated ? (
					<>
						<Stack.Screen name="Main" component={MainTabs} />
						<Stack.Screen
							name="SearchResults"
							component={SearchResultsScreen}
						/>
						<Stack.Screen name="Bookmarks" component={BookmarksScreen} />
						<Stack.Screen name="UserComments" component={UserCommentsScreen} />
						<Stack.Screen name="IssueDetail" component={IssueDetailWrapper} />
					</>
				) : (
					<Stack.Screen name="Auth" component={LoginScreen} />
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}

export default function AppNavigator() {
	return (
		<AuthProvider>
			<BookmarkProvider>
				<CommentProvider>
					<AppNavigatorInner />
				</CommentProvider>
			</BookmarkProvider>
		</AuthProvider>
	);
}
