import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  price: string;

  @IsNotEmpty()
  @IsString()
  quantity: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsString()
  @IsOptional() 
  description: string;

  @IsString()
  @IsOptional() 
  image: string;

  imageData?: any;
}
