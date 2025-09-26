import L from "leaflet";
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import styled from "styled-components";
import { dataService } from "../services/supabase";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
	iconUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapPageContainer = styled.div`
  height: 100vh;
  position: relative;
  overflow: hidden;
`;

const MapHeader = styled.header`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: #000000;
  color: white;
  padding: 60px 20px 20px;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ActionButton = styled.button`
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  color: white;

  &:hover {
    background: rgba(255,255,255,0.3);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ViewToggle = styled.button`
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  color: white;

  &:hover {
    background: rgba(255,255,255,0.3);
    transform: translateY(-1px);
  }

  span {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
  }
`;

const LocationIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(255,255,255,0.15);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  width: fit-content;

  span {
    font-size: 12px;
    margin: 0;
    opacity: 0.9;
  }
`;

const MapWrapper = styled.div`
  height: 100vh;
  padding-top: 140px;
  box-sizing: border-box;

  .leaflet-container {
    height: 100%;
    width: 100%;
  }
`;

const MapControls = styled.div`
  position: absolute;
  bottom: 100px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  z-index: 1000;
  gap: 12px;
`;

const ControlButton = styled.button`
  background: rgba(0,0,0,0.8);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);

  &:hover {
    background: rgba(0,0,0,0.9);
    transform: translateY(-2px);
  }

  span {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
  }
`;

const IssuesList = styled.div`
  position: fixed;
  top: 140px;
  left: 0;
  right: 0;
  bottom: 80px;
  background: #f8fafc;
  z-index: 999;
  overflow-y: auto;
  padding: 20px;
  transform: translateX(${(props) => (props.show ? "0" : "100%")});
  transition: transform 0.3s ease;
`;

const IssuesContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const IssueCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const PriorityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
`;

const PriorityDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => props.color};
`;

const PriorityText = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: ${(props) => props.color};
  text-transform: uppercase;
`;

const IssueTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  line-height: 1.4;
`;

const IssueDescription = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 16px 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #64748b;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top: 3px solid #000000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const FAB = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  background: #000000;
  border: none;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  z-index: 1001;
  color: white;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.4);
  }

  &:active {
    transform: translateY(-1px);
  }
`;

// Custom hook to update map center
const MapController = ({ center, zoom }) => {
	const map = useMap();

	useEffect(() => {
		if (center) {
			map.setView(center, zoom || 15);
		}
	}, [map, center, zoom]);

	return null;
};

// Create custom icons for different priorities
const createCustomIcon = (priority, category) => {
	const colors = {
		high: "#ef4444",
		medium: "#f59e0b",
		low: "#10b981",
		critical: "#dc2626",
	};

	const icons = {
		infrastructure: "🏗️",
		road_maintenance: "🚧",
		safety: "🛡️",
		environment: "🌿",
		maintenance: "🔧",
		accessibility: "♿",
	};

	const color = colors[priority] || "#6b7280";
	const icon = icons[category] || "⚠️";
	const size = priority === "critical" ? 44 : priority === "high" ? 40 : 36;

	return L.divIcon({
		className: "custom-marker",
		html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size > 40 ? "18px" : "16px"};
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s ease;
      ">${icon}</div>
    `,
		iconSize: [size + 6, size + 6],
		iconAnchor: [(size + 6) / 2, (size + 6) / 2],
	});
};

const Map = () => {
	const [issues, setIssues] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showList, setShowList] = useState(false);
	const [userLocation, setUserLocation] = useState(null);
	const [mapCenter, setMapCenter] = useState([18.15, -77.3]);
	const [mapZoom, setMapZoom] = useState(8);

	useEffect(() => {
		loadIssues();
	}, []);

	const loadIssues = async () => {
		try {
			setLoading(true);
			const data = await dataService.getIssues();
			// Filter issues with valid coordinates
			const validIssues = data.filter(
				(issue) =>
					issue.latitude &&
					issue.longitude &&
					!isNaN(Number.parseFloat(issue.latitude)) &&
					!isNaN(Number.parseFloat(issue.longitude)),
			);
			setIssues(validIssues);
		} catch (error) {
			console.error("Error loading issues:", error);
		} finally {
			setLoading(false);
		}
	};

	const getUserLocation = async () => {
		try {
			const position = await new Promise((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject);
			});

			const { latitude, longitude } = position.coords;
			setUserLocation({ lat: latitude, lng: longitude });

			// Center map on user location if in Jamaica
			if (
				latitude > 17.5 &&
				latitude < 18.8 &&
				longitude > -78.5 &&
				longitude < -76.0
			) {
				setMapCenter([latitude, longitude]);
				setMapZoom(15);
			}
		} catch (error) {
			console.error("Error getting location:", error);
			alert("Unable to get your location. Please enable location services.");
		}
	};

	const centerOnJamaica = () => {
		setMapCenter([18.15, -77.3]);
		setMapZoom(8);
	};

	const selectIssue = (issue) => {
		const lat = Number.parseFloat(issue.latitude);
		const lng = Number.parseFloat(issue.longitude);

		if (showList) {
			setShowList(false);
		}

		setMapCenter([lat, lng]);
		setMapZoom(16);
	};

	const formatTimeAgo = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInSeconds = Math.floor((now - date) / 1000);

		if (diffInSeconds < 60) return "Just now";
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
		if (diffInSeconds < 86400)
			return `${Math.floor(diffInSeconds / 3600)}h ago`;
		return `${Math.floor(diffInSeconds / 86400)}d ago`;
	};

	const getPriorityColor = (priority) => {
		const colors = {
			high: "#ef4444",
			medium: "#f59e0b",
			low: "#10b981",
			critical: "#dc2626",
		};
		return colors[priority] || "#6b7280";
	};

	return (
		<MapPageContainer>
			{/* Header */}
			<MapHeader>
				<HeaderContent>
					<TitleRow>
						<TitleSection>
							<IconContainer>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2" />
									<line x1="8" y1="2" x2="8" y2="18" />
									<line x1="16" y1="6" x2="16" y2="22" />
								</svg>
							</IconContainer>
							<div>
								<Title>Explore Issues</Title>
								<Subtitle>Jamaica Community Map</Subtitle>
							</div>
						</TitleSection>

						<HeaderActions>
							<ActionButton onClick={loadIssues} disabled={loading}>
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<polyline points="23,4 23,10 17,10" />
									<polyline points="1,20 1,14 7,14" />
									<path d="m20.49,9a9,9,0,0,0-2.12-5.12,9,9,0,0,0-13.74,0" />
									<path d="M3.51,15a9,9,0,0,0,13.74,0,9,9,0,0,0,2.12-5.12" />
								</svg>
							</ActionButton>

							<ViewToggle onClick={() => setShowList(!showList)}>
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									{showList ? (
										<>
											<polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2" />
											<line x1="8" y1="2" x2="8" y2="18" />
											<line x1="16" y1="6" x2="16" y2="22" />
										</>
									) : (
										<>
											<line x1="8" y1="6" x2="21" y2="6" />
											<line x1="8" y1="12" x2="21" y2="12" />
											<line x1="8" y1="18" x2="21" y2="18" />
											<line x1="3" y1="6" x2="3.01" y2="6" />
											<line x1="3" y1="12" x2="3.01" y2="12" />
											<line x1="3" y1="18" x2="3.01" y2="18" />
										</>
									)}
								</svg>
								<span>{showList ? "Map" : "List"}</span>
							</ViewToggle>
						</HeaderActions>
					</TitleRow>

					{userLocation && (
						<LocationIndicator>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
								<circle cx="12" cy="10" r="3" />
							</svg>
							<span>
								Location: {userLocation.lat.toFixed(4)},{" "}
								{userLocation.lng.toFixed(4)}
							</span>
						</LocationIndicator>
					)}
				</HeaderContent>
			</MapHeader>

			{/* Map */}
			{!showList && (
				<MapWrapper>
					<MapContainer
						center={mapCenter}
						zoom={mapZoom}
						style={{ height: "100%", width: "100%" }}
					>
						<MapController center={mapCenter} zoom={mapZoom} />

						<TileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
							url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
						/>

						{/* User location marker */}
						{userLocation && (
							<Marker
								position={[userLocation.lat, userLocation.lng]}
								icon={L.divIcon({
									className: "user-location-marker",
									html: `
                    <div style="
                      width: 20px;
                      height: 20px;
                      background: #000000;
                      border: 3px solid white;
                      border-radius: 50%;
                      box-shadow: 0 4px 12px rgba(102,126,234,0.4);
                      animation: pulse 2s infinite;
                    "></div>
                    <style>
                      @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.2); }
                      }
                    </style>
                  `,
									iconSize: [26, 26],
									iconAnchor: [13, 13],
								})}
							>
								<Popup>Your Location</Popup>
							</Marker>
						)}

						{/* Issue markers */}
						{issues.map((issue) => {
							const lat = Number.parseFloat(issue.latitude);
							const lng = Number.parseFloat(issue.longitude);

							if (isNaN(lat) || isNaN(lng)) return null;

							return (
								<Marker
									key={issue.id}
									position={[lat, lng]}
									icon={createCustomIcon(issue.priority, issue.category)}
								>
									<Popup>
										<div
											style={{
												fontFamily: "Poppins, sans-serif",
												minWidth: "200px",
											}}
										>
											<div
												style={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "flex-start",
													marginBottom: "8px",
												}}
											>
												<div
													style={{
														padding: "4px 8px",
														borderRadius: "12px",
														fontSize: "10px",
														fontWeight: "700",
														textTransform: "uppercase",
														background: getPriorityColor(issue.priority),
														color: "white",
													}}
												>
													{issue.priority}
												</div>
											</div>

											<h4
												style={{
													margin: "0 0 6px 0",
													fontSize: "14px",
													fontWeight: "700",
													color: "#1e293b",
												}}
											>
												{issue.title}
											</h4>

											<p
												style={{
													margin: "0 0 8px 0",
													fontSize: "12px",
													color: "#64748b",
													lineHeight: "1.4",
												}}
											>
												{issue.description}
											</p>

											<div
												style={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
													fontSize: "11px",
													color: "#94a3b8",
												}}
											>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: "4px",
													}}
												>
													<svg
														width="12"
														height="12"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2"
													>
														<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
														<circle cx="12" cy="10" r="3" />
													</svg>
													{issue.address || "Jamaica"}
												</div>
												<div>
													by {issue.profiles?.name || "Anonymous"} •{" "}
													{formatTimeAgo(issue.created_at)}
												</div>
											</div>
										</div>
									</Popup>
								</Marker>
							);
						})}
					</MapContainer>
				</MapWrapper>
			)}

			{/* Issues List */}
			<IssuesList show={showList}>
				<IssuesContent>
					{loading ? (
						<LoadingContainer>
							<LoadingSpinner />
							<p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>
								Loading issues...
							</p>
						</LoadingContainer>
					) : issues.length === 0 ? (
						<div
							style={{
								textAlign: "center",
								padding: "60px 20px",
								color: "#94a3b8",
							}}
						>
							<svg
								width="48"
								height="48"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1"
								style={{ marginBottom: "16px" }}
							>
								<polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2" />
								<line x1="8" y1="2" x2="8" y2="18" />
								<line x1="16" y1="6" x2="16" y2="22" />
							</svg>
							<h3
								style={{
									fontSize: "18px",
									fontWeight: "600",
									margin: "16px 0 8px 0",
									color: "#64748b",
								}}
							>
								No Issues Found
							</h3>
							<p style={{ fontSize: "14px", margin: 0 }}>
								Be the first to report an issue in your area
							</p>
						</div>
					) : (
						issues.map((issue) => (
							<IssueCard key={issue.id} onClick={() => selectIssue(issue)}>
								<CardHeader>
									<PriorityBadge>
										<PriorityDot color={getPriorityColor(issue.priority)} />
										<PriorityText color={getPriorityColor(issue.priority)}>
											{issue.priority}
										</PriorityText>
									</PriorityBadge>
								</CardHeader>

								<IssueTitle>{issue.title}</IssueTitle>
								<IssueDescription>{issue.description}</IssueDescription>

								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										fontSize: "12px",
										color: "#94a3b8",
									}}
								>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "4px",
										}}
									>
										<svg
											width="12"
											height="12"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										>
											<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
											<circle cx="12" cy="10" r="3" />
										</svg>
										{issue.address || "Jamaica"}
									</div>
									<div>{formatTimeAgo(issue.created_at)}</div>
								</div>
							</IssueCard>
						))
					)}
				</IssuesContent>
			</IssuesList>

			{/* Map Controls */}
			{!showList && (
				<MapControls>
					<ControlButton onClick={centerOnJamaica}>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<circle cx="12" cy="12" r="10" />
							<path d="M12 6v6l4 2" />
						</svg>
						<span>Jamaica</span>
					</ControlButton>

					<ControlButton onClick={getUserLocation}>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<circle cx="12" cy="12" r="3" />
							<path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
						</svg>
						<span>My Location</span>
					</ControlButton>
				</MapControls>
			)}

			{/* FAB */}
			<FAB onClick={() => (window.location.href = "/report")}>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<line x1="12" y1="5" x2="12" y2="19" />
					<line x1="5" y1="12" x2="19" y2="12" />
				</svg>
			</FAB>
		</MapPageContainer>
	);
};

export default Map;
