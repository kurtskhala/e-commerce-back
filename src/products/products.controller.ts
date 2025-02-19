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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { IsValidMongoId } from 'src/users/dto/isValidMongoId.dto';
import { IsAdminGuard } from 'src/auth/isAdmin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard, IsAdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() avatar: Multer.File,
    @Body() createProductDto: CreateProductDto,
  ) {
    const path = Math.random().toString().substring(2);
    const filePath = `images/${path}`;
    const imagePath = avatar
      ? await this.productsService.uploadImage(filePath, avatar.buffer)
      : '';
    return this.productsService.create({
      ...createProductDto,
      image: imagePath,
    });
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
