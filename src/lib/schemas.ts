import { z } from "zod";

export const rsvpSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
  attending: z.boolean(),
  guests: z.number().int().min(0, "Cannot have negative guests").max(10, "Maximum 10 guests allowed"),
  dietaryRestrictions: z.string().max(500, "Dietary restrictions too long").optional(),
  createdAt: z.string().datetime(),
});

export const rsvpFormSchema = rsvpSchema.omit({
  id: true,
  createdAt: true,
});

export type RSVP = z.infer<typeof rsvpSchema>;
export type RSVPFormData = z.infer<typeof rsvpFormSchema>;

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  theme: z.string(),
});

export type User = z.infer<typeof userSchema>;
