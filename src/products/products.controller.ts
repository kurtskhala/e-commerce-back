import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { IsValidMongoId } from 'src/users/dto/isValidMongoId.dto';
import { IsAdminGuard } from 'src/auth/isAdmin.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard, IsAdminGuard)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param() param: IsValidMongoId) {
    return this.productsService.findOne(param.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, IsAdminGuard)
  update(
    @Param() param: IsValidMongoId,
    @Body() updatePostDto: UpdateProductDto,
  ) {
    
    return this.productsService.update(param.id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, IsAdminGuard)  
  remove(@Param() params) {
    return this.productsService.remove(params.id);
  }
}
