"use client";

import { Button } from "@web/components/ui/button";
import { Card } from "@web/components/ui/card";
import { Input } from "@web/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@web/components/ui/select";
import { eden } from "@web/lib/eden";
import type { CategoryOption } from "@web/types";
import { useForm } from "@tanstack/react-form";
import { MapPin } from "lucide-react";
import z from "zod";

interface CreateExperienceCardProps {
	categoryOptions: CategoryOption;
}

export default function CreateExperienceCard({ categoryOptions }: CreateExperienceCardProps) {

	const form = useForm({
		defaultValues: {
			title: "",
			categoryId: "",
		},
		onSubmit: async ({ value }) => await eden.experience.post({
			categoryId: value.categoryId,
			title: value.title,
			description: 'Created via feed',
			latitude: "0",
			longitude: "0",
			address: "123 Main St, Anytown, USA",
			status: "pending",
			priority: "medium",
		}),
		validators: {
			onSubmit: z.object({
				title: z.string().min(1, "Title is required"),
				categoryId: z.string().min(1, "Category is required"),
			}),
		},
	});

	return (
		<Card className="border-gray-800 bg-black p-6">
			<form onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}} className="flex space-x-3">
				<div className="flex-1 space-y-3">
					<div>
						<form.Field name="title">
							{(field) => (
								<div className="space-y-2">
									<Input
										id={field.name}
										name={field.name}
										type="text"
										placeholder="What's happening?"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="border-0 bg-transparent text-lg text-white placeholder:text-gray-500 focus-visible:ring-0"
									/>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="mt-1 text-red-500 text-sm">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4 text-gray-500 text-sm">
							<div className="flex items-center space-x-1">
								<MapPin className="h-4 w-4" />
								<span>Add location</span>
							</div>
							<form.Field name="categoryId">
								{(field) => (
									<div className="space-y-2">
										<Select value={field.state.value} onValueChange={field.handleChange}>
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
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="mt-1 text-red-500 text-sm">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>
						<form.Subscribe>
							{(state) => (
								<Button
									type="submit"
									className="rounded-full px-6"
									disabled={!state.canSubmit || state.isSubmitting}
								>
									{state.isSubmitting ? "Creating experience..." : "Create Experience"}
								</Button>
							)}
						</form.Subscribe>
					</div>
				</div>
			</form>
		</Card>
	);
}
