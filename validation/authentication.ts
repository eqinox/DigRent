import { z } from "zod";

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, "Имейлът е задължителен")
  .email("Моля, въведете валиден имейл");

// Username validation schema (optional)
export const usernameSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || val.length >= 2,
    "Потребителското име трябва да бъде поне 2 символа"
  );

// Password validation schema
export const passwordSchema = z
  .string()
  .min(1, "Паролата е задължителна")
  .min(6, "Паролата трябва да бъде поне 6 символа");

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Signup form schema
export const signupSchema = z
  .object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Моля, потвърдете паролата"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Паролите не съвпадат",
    path: ["confirmPassword"],
  });

// Type definitions
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;

// Validation functions
export const validateEmail = (email: string): string | null => {
  const result = emailSchema.safeParse(email);
  return result.success ? null : result.error.issues[0].message;
};

export const validatePassword = (password: string): string | null => {
  const result = passwordSchema.safeParse(password);
  return result.success ? null : result.error.issues[0].message;
};

export const validateConfirmPassword = (
  confirmPassword: string,
  password: string
): string | null => {
  const result = signupSchema.shape.confirmPassword.safeParse(confirmPassword);
  if (!result.success) {
    return result.error.issues[0].message;
  }
  // Check if passwords match
  if (confirmPassword && password !== confirmPassword) {
    return "Паролите не съвпадат";
  }
  return null;
};

// Full form validation functions
export const validateLoginForm = (data: LoginFormData) => {
  return loginSchema.safeParse(data);
};

export const validateSignupForm = (data: SignupFormData) => {
  return signupSchema.safeParse(data);
};









