"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useState } from "react";

interface SearchContextType {
	onSearch: (searchTerm: string) => void;
	onSearchChange: (searchTerm: string) => void;
	onCategoryFilter: (categoryName: string) => void;
	setSearchHandler: (handler: (searchTerm: string) => void) => void;
	setSearchChangeHandler: (handler: (searchTerm: string) => void) => void;
	setCategoryFilterHandler: (handler: (categoryName: string) => void) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({
	children,
	onSearch,
}: {
	children: ReactNode;
	onSearch: (searchTerm: string) => void;
}) {
	const [searchHandler, setSearchHandler] =
		useState<(searchTerm: string) => void>(onSearch);
	const [searchChangeHandler, setSearchChangeHandler] = useState<
		(searchTerm: string) => void
	>(() => () => {});
	const [categoryFilterHandler, setCategoryFilterHandler] = useState<
		(categoryName: string) => void
	>(() => () => {});

	const handleSearch = useCallback(
		(searchTerm: string) => {
			searchHandler(searchTerm);
		},
		[searchHandler],
	);

	const handleSearchChange = useCallback(
		(searchTerm: string) => {
			searchChangeHandler(searchTerm);
		},
		[searchChangeHandler],
	);

	const handleCategoryFilter = useCallback(
		(categoryName: string) => {
			categoryFilterHandler(categoryName);
		},
		[categoryFilterHandler],
	);

	const setHandler = useCallback((handler: (searchTerm: string) => void) => {
		setSearchHandler(() => handler);
	}, []);

	const setChangeHandler = useCallback(
		(handler: (searchTerm: string) => void) => {
			setSearchChangeHandler(() => handler);
		},
		[],
	);

	const setCategoryHandler = useCallback(
		(handler: (categoryName: string) => void) => {
			setCategoryFilterHandler(() => handler);
		},
		[],
	);

	return (
		<SearchContext.Provider
			value={{
				onSearch: handleSearch,
				onSearchChange: handleSearchChange,
				onCategoryFilter: handleCategoryFilter,
				setSearchHandler: setHandler,
				setSearchChangeHandler: setChangeHandler,
				setCategoryFilterHandler: setCategoryHandler,
			}}
		>
			{children}
		</SearchContext.Provider>
	);
}

export function useSearch() {
	const context = useContext(SearchContext);
	if (context === undefined) {
		throw new Error("useSearch must be used within a SearchProvider");
	}
	return context;
}
