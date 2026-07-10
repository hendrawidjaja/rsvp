import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    confirmPassword: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const rsvpSchema = z.object({
  attending: z.boolean(),
  createdAt: z.string().datetime(),
  dietaryRestrictions: z.string().max(500).optional(),
  email: z.string().email("Invalid email address"),
  guests: z.number().int().min(0).max(10, "Maximum 10 guests allowed"),
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

export const rsvpFormSchema = rsvpSchema.omit({ createdAt: true, id: true });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type RSVP = z.infer<typeof rsvpSchema>;
export type RSVPFormData = z.infer<typeof rsvpFormSchema>;

export const userSchema = z.object({
  email: z.string().email(),
  id: z.string(),
  name: z.string(),
  theme: z.string(),
});

export type User = z.infer<typeof userSchema>;