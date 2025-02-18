import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schema/product.schema';
import { isValidObjectId, Model } from 'mongoose';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';

@Injectable()
export class ProductsService {
  constructor(
    private awsS3Service: AwsS3Service,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const post = await this.productModel.create({
      ...createProductDto,
    });
    return post;
  }

  findAll() {
    return this.productModel.find();
  }

  async findOne(id) {
    if (!isValidObjectId(id))
      throw new BadGatewayException('Not valid id is provided');

    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  update(id, updateProductDto: UpdateProductDto) {
    return this.productModel.findByIdAndUpdate(id, updateProductDto, {
      new: true,
    });
  }

  async remove(id: number) {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new BadGatewayException('Expense not found');
    }

    const deletedPost = await this.productModel.findByIdAndDelete(id);
    return { message: 'post deleted', data: deletedPost };
  }

  uploadImage(filePath, file) {
    return this.awsS3Service.uploadImage(filePath, file);
  }

  getImage(fileId) {
    return this.awsS3Service.getImageByFileId(fileId);
  }

  deleteImage(fileId) {
    return this.awsS3Service.deleteImageByFileId(fileId);
  }
}
