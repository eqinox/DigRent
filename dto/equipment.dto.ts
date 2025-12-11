export interface EquipmentResponseDto {
  id: string;
  name: string;
  description: string;
  subCategoryId: string;
  pricePerDay: number;
  available: boolean;
  locationId: string;
  owner: string;
  images: Array<{ original: string; small: string }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EquipmentDeleteResponseDto {
  message: string;
}
