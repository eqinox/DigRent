export interface SubCategoryResponseDto {
  id: string;
  categoryId: string;
  type: string;
  minRange: number;
  maxRange: number;
  image?: {
    original: string;
    small: string;
  };
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubCategoryDeleteResponseDto {
  message: string;
}
