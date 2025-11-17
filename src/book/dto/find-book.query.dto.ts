import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { BookStatus } from 'src/models/model.book';

const toArray = (value: any): string[] | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.filter((item) => !!item);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => !!item);
  }

  return undefined;
};

const toNumber = (value: any): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export class FindBookQueryDto {
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsUUID('4', { each: true })
  session?: string[];

  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsUUID('4', { each: true })
  category?: string[];

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @Transform(({ value }) => toNumber(value))
  @IsInt()
  @Min(0)
  minViews?: number;

  @IsOptional()
  @Transform(({ value }) => toNumber(value))
  @IsInt()
  @Min(0)
  minDownload?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;

  @IsOptional()
  @Transform(({ value }) => {
    const parsed = Number(value);
    return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
  })
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Transform(({ value }) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 1) {
      return 10;
    }
    return parsed > 100 ? 100 : parsed;
  })
  @IsInt()
  @Min(1)
  limit = 10;
}

