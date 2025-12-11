// The Data of the response
export interface RegisterResponseDto {
  id: string;
  email: string;
  username?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

// The Data of the response
export interface LoginResponseDto {
  access_token: string;
  user: UserDto;
}

export interface LogoutResponseDto {
  message: string;
}

export interface UserDto {
  id: string;
  email: string;
  role: string;
}
