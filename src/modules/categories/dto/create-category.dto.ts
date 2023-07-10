import { CategoryCreateRequest } from '@protogen/category/category';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CategoryCreateInput implements CategoryCreateRequest {
  @IsString()
  @IsNotEmpty()
  userGuid: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  parentGuid: string;
}
