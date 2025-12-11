import { z } from "zod";

// Equipment form validation schema
export const equipmentSchema = z.object({
  name: z.string().min(1, "Името на оборудването е задължително"),
  description: z.string().min(1, "Описанието е задължително"),
  pricePerDay: z
    .number()
    .min(0.01, "Цената на ден трябва да бъде по-голяма от 0"),
  locationId: z.string().min(1, "Локацията е задължителна"),
  subCategoryId: z.string().uuid("Невалиден ID на подкатегорията"),
  available: z.boolean(),
  images: z.array(z.any()).min(1, "Поне едно изображение е задължително"),
});

// Type definition
export type EquipmentFormData = z.infer<typeof equipmentSchema>;

// Validation functions
export const validateEquipmentName = (name: string): string | null => {
  const result = equipmentSchema.shape.name.safeParse(name);
  return result.success ? null : result.error.issues[0].message;
};

export const validateEquipmentDescription = (
  description: string
): string | null => {
  const result = equipmentSchema.shape.description.safeParse(description);
  return result.success ? null : result.error.issues[0].message;
};

export const validateEquipmentPrice = (price: number): string | null => {
  const result = equipmentSchema.shape.pricePerDay.safeParse(price);
  return result.success ? null : result.error.issues[0].message;
};

export const validateEquipmentLocation = (location: string): string | null => {
  const result = equipmentSchema.shape.locationId.safeParse(location);
  return result.success ? null : result.error.issues[0].message;
};

// Full form validation function
export const validateEquipmentForm = (data: EquipmentFormData) => {
  return equipmentSchema.safeParse(data);
};
