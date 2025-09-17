import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GetEventsQueryDto {
  @ApiPropertyOptional({ description: 'City slug, e.g. barcelona' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Category slug, e.g. techno' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'From ISO date (inclusive)', example: '2025-09-01' })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({ description: 'To ISO date (inclusive)', example: '2025-10-31' })
  @IsOptional()
  @IsISO8601()
  to?: string;

  @ApiPropertyOptional({ enum: ['startAt', 'createdAt'], default: 'startAt' })
  @IsOptional()
  @IsIn(['startAt', 'createdAt'])
  sort?: 'startAt' | 'createdAt' = 'startAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(50)
  pageSize?: number = 20;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Type(() => Boolean)
  featuredFirst?: boolean = true;
}

export type EventListItem = {
  id: string;
  title: string;
  slug: string;
  startAt: string;
  endAt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  isFeatured: boolean;
  coverImage: string | null;
  city: { slug: string; name: string; countryCode: string };
  venue: { id: string; name: string; slug: string };
  categories: { slug: string; name: string }[];
  minPrice: number | null;
};

export type EventListResponse = {
  items: EventListItem[];
  page: number;
  pageSize: number;
  total: number;
};
