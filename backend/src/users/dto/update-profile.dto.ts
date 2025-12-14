import { IsString, IsOptional, MaxLength, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  avatar?: string;
}
