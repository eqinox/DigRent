import { z } from "zod";

// Base category schema (common fields)
const categoryBaseSchema = z.object({
  name: z
    .string()
    .min(1, "Името на категорията е задължително")
    .min(2, "Името трябва да бъде поне 2 символа")
    .max(100, "Името не може да бъде по-дълго от 100 символа"),
});

// Category validation schema for creating (no id needed)
export const categoryCreateSchema = categoryBaseSchema.extend({
  image: z.any().refine((file) => file !== null, {
    message: "Снимката е задължителна",
  }),
});

// Category validation schema for updating (id is required, image is optional)
export const categoryUpdateSchema = categoryBaseSchema.extend({
  id: z.string().min(1, "ID на категорията е задължително"),
  image: z.any().optional(), // Image is optional in edit mode - only sent if new file is selected
});

export const categorySchema = categoryUpdateSchema;

// Type definitions
export type CategoryCreateData = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateData = z.infer<typeof categoryUpdateSchema>;

// Validation functions
export const validateCategoryName = (name: string): string | null => {
  const result = categoryBaseSchema.shape.name.safeParse(name);
  return result.success ? null : result.error.issues[0].message;
};

// Full form validation functions
export const validateCategoryCreateForm = (data: CategoryCreateData) => {
  return categoryCreateSchema.safeParse(data);
};

export const validateCategoryUpdateForm = (data: CategoryUpdateData) => {
  return categoryUpdateSchema.safeParse(data);
};
