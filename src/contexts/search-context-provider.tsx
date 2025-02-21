"use client";

import { createContext, useState } from "react";

type SearchContextProviderType = {
	children: React.ReactNode;
};

type TSearchContext = {
	searchQuery: string;
	handleChangeSearchQuery(query: string): void;
};

export const SearchContext = createContext<TSearchContext | null>(null);

export default function SearchContextProvider({ children }: SearchContextProviderType) {
	// state
	const [searchQuery, setSearchQuery] = useState<string>("");

	// derived state

	// event handlers
	const handleChangeSearchQuery = (query: string) => {
		setSearchQuery(query);
	};

	return (
		<SearchContext.Provider
			value={{
				searchQuery,
				handleChangeSearchQuery,
			}}>
			{children}
		</SearchContext.Provider>
	);
}
