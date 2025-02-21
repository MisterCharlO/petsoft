import { z } from "zod";
import { DEFAULT_PET_IMAGE_URL } from "./constants";

export const petIdSchema = z.string().cuid("Invalid pet ID");

export const petFormSchema = z
	.object({
		name: z.string().trim().nonempty("Name is required").max(100, "Name must be less than 100 characters"),
		ownerName: z.string().nonempty("Owner name is required").max(100, "Name must be less than 100 characters"),
		age: z.coerce.number().int().positive("Age must be a positive number").max(99999),
		imageUrl: z.union([z.literal(""), z.string().trim().url("Invalid URL")]),
		notes: z.union([z.literal(""), z.string().trim().max(1000, "Notes must be less than 1000 characters")]),
	})
	.transform((data) => ({
		...data,
		imageUrl: data.imageUrl || DEFAULT_PET_IMAGE_URL,
	}));

export type TPetForm = z.infer<typeof petFormSchema>;

export const authSchema = z.object({
	email: z.string().email().max(100),
	password: z.string().max(100),
});

export type TAuth = z.infer<typeof authSchema>;
