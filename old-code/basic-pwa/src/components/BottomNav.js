import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../services/AuthContext";

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
`;

const NavItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  color: ${(props) => (props.active ? "#000000" : "#64748b")};
  transition: all 0.2s ease;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  background: ${(props) => (props.active ? "#f8fafc" : "transparent")};

  &:hover {
    color: #000000;
    background: #f8fafc;
  }

  svg {
    width: 24px;
    height: 24px;
    margin-bottom: 4px;
  }

  span {
    font-size: 12px;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
  }
`;

const BottomNav = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { user } = useAuth();

	// Don't show nav on login page or if not authenticated
	if (location.pathname === "/" || !user) {
		return null;
	}

	const navItems = [
		{
			path: "/home",
			icon: (
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
					<polyline points="9,22 9,12 15,12 15,22" />
				</svg>
			),
			label: "Home",
		},
		{
			path: "/map",
			icon: (
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2" />
					<line x1="8" y1="2" x2="8" y2="18" />
					<line x1="16" y1="6" x2="16" y2="22" />
				</svg>
			),
			label: "Map",
		},
		{
			path: "/report",
			icon: (
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<circle cx="12" cy="12" r="10" />
					<line x1="12" y1="8" x2="12" y2="12" />
					<line x1="12" y1="16" x2="12.01" y2="16" />
				</svg>
			),
			label: "Report",
		},
		{
			path: "/profile",
			icon: (
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
					<circle cx="12" cy="7" r="4" />
				</svg>
			),
			label: "Profile",
		},
	];

	return (
		<NavContainer>
			{navItems.map((item) => (
				<NavItem
					key={item.path}
					active={location.pathname === item.path}
					onClick={() => navigate(item.path)}
				>
					{item.icon}
					<span>{item.label}</span>
				</NavItem>
			))}
		</NavContainer>
	);
};

export default BottomNav;
