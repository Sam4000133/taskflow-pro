export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  createdAt: Date;
}

export class AuthResponseDto {
  user: UserResponseDto;
  access_token: string;
}
