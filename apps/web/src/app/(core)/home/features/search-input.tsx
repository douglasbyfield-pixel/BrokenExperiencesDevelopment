"use client";

import { Input } from "@web/components/ui/input";
import { useState, useEffect, useCallback } from "react";

interface SearchInputProps {
	onSearch?: (searchTerm: string) => void;
	onSearchChange?: (searchTerm: string) => void;
	placeholder?: string;
	value?: string;
}

export default function SearchInput({ onSearch, onSearchChange, placeholder = "Search experiences", value }: SearchInputProps) {
	const [searchTerm, setSearchTerm] = useState(value || "");

	// Debounced search effect
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			onSearchChange?.(searchTerm);
		}, 300); // 300ms debounce

		return () => clearTimeout(timeoutId);
	}, [searchTerm, onSearchChange]);

	// Update local state when value prop changes
	useEffect(() => {
		if (value !== undefined) {
			setSearchTerm(value);
		}
	}, [value]);

	const handleSearch = (term: string) => {
		if (!term.trim()) return;
		onSearch?.(term);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch(searchTerm);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setSearchTerm(newValue);
	};

	return (
		<div className="relative">
			<svg className="absolute left-4 top-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			<Input
				placeholder={placeholder}
				className="rounded-full border-gray-200 bg-gray-50 pl-12 pr-4 py-2 focus:bg-white focus:border-gray-300 text-black placeholder:text-gray-400"
				value={searchTerm}
				onChange={handleInputChange}
				onKeyPress={handleKeyPress}
			/>
		</div>
	);
}