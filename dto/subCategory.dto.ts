import { CategoryResponseDto } from "./category.dto";
import { ImageDto } from "./common.dto";

export interface SubCategoryResponseDto {
  id: string;
  category: CategoryResponseDto;
  type: string;
  minRange: number;
  maxRange: number;
  image?: ImageDto;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubCategoryDeleteResponseDto {
  message: string;
}
