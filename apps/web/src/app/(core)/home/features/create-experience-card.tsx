"use client";

import { Clock, MapPin } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { eden } from "@/lib/eden";
import type { CategoryOption } from "@/types";

interface CreateExperienceCardProps {
	categoryOptions: CategoryOption;
}

export default function CreateExperienceCard({ categoryOptions }: CreateExperienceCardProps) {
	const [post, setPost] = useState("");
	const [categoryId, setCategoryId] = useState("");

	const handleCreateExperience = async () => await eden.experience.post({
			categoryId: categoryId,
			title: post,
			description: post,
			latitude: "0",
			longitude: "0",
			address: "123 Main St, Anytown, USA",
			status: "pending",
			priority: "medium",
		});

	return (
		<Card className="border-gray-800 bg-black p-6">
			<div className="flex space-x-3">
				<Avatar className="h-10 w-10">
					<AvatarImage src="/avatars/you.jpg" />
					<AvatarFallback>YO</AvatarFallback>
				</Avatar>
				<div className="flex-1 space-y-3">
					<Select value={categoryId} onValueChange={setCategoryId}>
						<SelectTrigger>
							<SelectValue placeholder="Select a category" />
						</SelectTrigger>
						<SelectContent>
							{categoryOptions.map((category) => (
								<SelectItem key={category.id} value={category.id}>
									{category.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Input
						placeholder="What's happening?"
						value={post}
						onChange={(e) => setPost(e.target.value)}
						className="border-0 bg-transparent text-lg text-white placeholder:text-gray-500 focus-visible:ring-0"
					/>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4 text-gray-500 text-sm">
							<div className="flex items-center space-x-1">
								<MapPin className="h-4 w-4" />
								<span>Add location</span>
							</div>
							<div className="flex items-center space-x-1">
								<Clock className="h-4 w-4" />
								<span>Schedule</span>
							</div>
						</div>
						<Button onClick={handleCreateExperience} className="rounded-full px-6">Post</Button>
					</div>
				</div>
			</div>
		</Card>
	);
}
