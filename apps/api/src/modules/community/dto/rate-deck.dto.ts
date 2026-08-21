import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class RateDeckDto {
  @IsInt({ message: 'Rating must be an integer between 1 and 5' })
  @Min(1, { message: 'Rating must be at least 1 star' })
  @Max(5, { message: 'Rating cannot exceed 5 stars' })
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Comment cannot exceed 500 characters' })
  comment?: string;
}
