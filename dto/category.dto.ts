import { ImageDto } from "./common.dto";

export interface CategoryResponseDto {
  id: string;
  name: string;
  image: ImageDto;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryDeleteResponseDto {
  message: string;
}
