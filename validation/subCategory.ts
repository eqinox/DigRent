import { z } from "zod";

// Base subCategory schema (common fields)
const subCategoryBaseSchema = z.object({
  type: z
    .string()
    .min(1, "Типът на подкатегорията е задължителен")
    .min(2, "Типът трябва да бъде поне 2 символа")
    .max(100, "Типът не може да бъде по-дълъг от 100 символа"),
  minRange: z
    .number()
    .positive("Минималният обхват трябва да бъде положително число")
    .min(0, "Минималният обхват не може да бъде отрицателен"),
  maxRange: z
    .number()
    .positive("Максималният обхват трябва да бъде положително число")
    .min(0, "Максималният обхват не може да бъде отрицателен"),
});

// SubCategory validation schema for creating (no id needed)
export const subCategoryCreateSchema = subCategoryBaseSchema
  .extend({
    categoryId: z.string().min(1, "ID на категорията е задължително"),
    image: z.any().refine((file) => file !== null, {
      message: "Снимката е задължителна",
    }),
  })
  .refine((data) => data.maxRange > data.minRange, {
    message: "Максималният обхват трябва да бъде по-голям от минималния",
    path: ["maxRange"],
  });

// SubCategory validation schema for updating (id is required)
export const subCategoryUpdateSchema = subCategoryBaseSchema
  .extend({
    id: z.string().min(1, "ID на подкатегорията е задължително"),
    image: z.any().optional(),
  })
  .refine((data) => data.maxRange > data.minRange, {
    message: "Максималният обхват трябва да бъде по-голям от минималния",
    path: ["maxRange"],
  });

export const subCategorySchema = subCategoryUpdateSchema;

// Type definitions
export type SubCategoryCreateData = z.infer<typeof subCategoryCreateSchema>;
export type SubCategoryUpdateData = z.infer<typeof subCategoryUpdateSchema>;

// Validation functions
export const validateSubCategoryType = (type: string): string | null => {
  const result = subCategoryBaseSchema.shape.type.safeParse(type);
  return result.success ? null : result.error.issues[0].message;
};

// Full form validation functions
export const validateSubCategoryCreateForm = (data: SubCategoryCreateData) => {
  return subCategoryCreateSchema.safeParse(data);
};

export const validateSubCategoryUpdateForm = (data: SubCategoryUpdateData) => {
  return subCategoryUpdateSchema.safeParse(data);
};







