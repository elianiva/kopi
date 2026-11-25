import { defineCollection, reference } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

const roasteries = defineCollection({
	loader: file("src/data/roasteries.yaml"),
	schema: z.object({
		name: z.string(),
		city: z.string(),
		country: z.string(),
	}),
});

const beans = defineCollection({
	loader: file("src/data/beans.yaml"),
	schema: z.object({
		name: z.string(),
		roastery: reference("roasteries"),
		country: z.string(),
		region: z.string().optional(),
		producer: z.string().optional(),
		process: z.string(),
		varieties: z.array(z.string()),
		altitude: z.number().optional(),
		roastLevel: z.string(),
		roastingMachine: z.string().optional(),
		roastDate: z.coerce.date(),
		harvest: z.string().optional(),
		weight: z.number(),
		tastingNotes: z.array(z.string()),
		note: z.string().optional(),
	}),
});

const brews = defineCollection({
	loader: file("src/data/brews.yaml"),
	schema: z.object({
		bean: reference("beans"),
		date: z.coerce.date(),
		method: z.string(),
		gear: z.string(),
		dose: z.number(),
		water: z.number(),
		waterBrand: z.string().optional(),
		waterPpm: z.number().optional(),
		waterTemp: z.number(),
		brewTime: z.string(),
		grinder: z.string(),
		grindSize: z.string(),
		filter: z.string().optional(),
		pourSpeed: z.number().optional(),
		pours: z.array(z.object({ at: z.string(), to: z.number() })),
		note: z.string().optional(),
		taste: z.object({
			fragrance: z.string().optional(),
			aroma: z.string().optional(),
			hot: z.string().optional(),
			warm: z.string().optional(),
			aftertaste: z.string().optional(),
			mouthfeel: z.string().optional(),
		}),
		nextTime: z.string().optional(),
	}),
});

export const collections = { roasteries, beans, brews };
