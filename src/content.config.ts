import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const recipes = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/recipes" }),
	schema: z
		.object({
			title: z.string(),
			description: z.string(),
			tags: z.array(z.string()),
			method: z.string(),
			ratio: z.string().optional(),
			dose: z.string().optional(),
			yield: z.string().optional(),
			brewTime: z.string().optional(),
			temperature: z.string().optional(),
			grindSize: z
				.enum([
					"fine",
					"medium-fine",
					"medium",
					"medium-coarse",
					"coarse",
				])
				.or(z.string())
				.optional(),
			difficulty: z
				.enum(["Beginner", "Intermediate", "Advanced"])
				.optional(),
			featured: z.boolean().default(false),
			publishedAt: z.date(),
			updatedAt: z.date().optional(),
			creator: z.string().optional(),
			coffeeGram: z.number().int().positive().optional(),
			waterTemp: z.number().int().min(20).max(100).optional(),
			roastLevel: z
				.enum([
					"light",
					"medium-light",
					"medium",
					"medium-dark",
					"dark",
				])
				.optional(),
			schedules: z
				.array(
					z.object({
						id: z.number().int().positive(),
						time: z.number().int().min(0),
						endTime: z.number().int().min(0),
						volume: z.number().int().min(0),
						label: z.string(),
					}),
				)
				.optional(),
		})
		.refine(
			(data) => {
				if (data.schedules) {
					return data.schedules.every(
						(schedule) => schedule.endTime >= schedule.time,
					);
				}
				return true;
			},
			{
				message:
					"Schedule endTime must be greater than or equal to time",
			},
		),
});

const brewers = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/brewers" }),
	schema: z.object({
		name: z.string(),
		location: z.string(),
		description: z.string(),
		website: z.string().url().optional(),
		instagram: z.string().optional(),
		specialty: z.string().optional(),
		featured: z.boolean().default(false),
		rating: z.number().min(1).max(5).optional(),
		establishedYear: z.number().optional(),
		publishedAt: z.date(),
		updatedAt: z.date().optional(),
	}),
});

const guides = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/guides" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		method: z.string(),
		difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
		estimatedTime: z.string(),
		equipment: z.array(z.string()),
		tags: z.array(z.string()),
		featured: z.boolean().default(false),
		publishedAt: z.date(),
		updatedAt: z.date().optional(),
	}),
});

export const collections = {
	recipes,
	brewers,
	guides,
};
