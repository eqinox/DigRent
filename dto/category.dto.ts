export interface CategoryResponseDto {
  id: string;
  name: string;
  equipment: string[];
  created_by: string;
  image: {
    small: string;
    original: string;
  };
}

export interface CategoryDeleteResponseDto {
  message: string;
}
