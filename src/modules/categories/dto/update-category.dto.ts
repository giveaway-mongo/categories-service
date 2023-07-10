import { CategoryUpdateRequest } from '@protogen/category/category';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CategoryUpdateInput implements CategoryUpdateRequest {
  @IsString()
  @IsNotEmpty()
  guid: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  userGuid: string;

  @IsString()
  @IsOptional()
  parentGuid: string;
}
