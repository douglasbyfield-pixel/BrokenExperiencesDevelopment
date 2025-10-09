"use client";

import { Button } from "@web/components/ui/button";
import { categories, LeaderboardCategory } from "./leaderboard-card";

interface CategorySelectorProps {
	selectedCategory: string;
	onCategoryChange: (category: string) => void;
}

export function CategorySelector({
	selectedCategory,
	onCategoryChange,
}: CategorySelectorProps) {
	return (
		<div className="flex flex-wrap gap-2">
			{categories.map((category) => {
				const Icon = category.icon;
				return (
					<Button
						key={category.id}
						variant={selectedCategory === category.id ? "default" : "outline"}
						onClick={() => onCategoryChange(category.id)}
						className="flex items-center gap-2"
					>
						<Icon className="h-4 w-4" />
						{category.name}
					</Button>
				);
			})}
		</div>
	);
}
