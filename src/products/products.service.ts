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
    const product = await this.productModel.create({
      ...createProductDto,
    });
    return product;
  }

  async findAll() {
    const products = await this.productModel.find();

    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        if (product.image) {
          try {
            const imageBase64 = await this.getImage(product.image);

            const productObj = product.toObject();
            productObj.imageData = imageBase64;

            return productObj;
          } catch (error) {
            console.error(
              `Failed to fetch image for product ${product._id}:`,
              error,
            );
            return product.toObject();
          }
        }
        return product.toObject();
      }),
    );

    return productsWithImages;
  }

  async findOne(id) {
    if (!isValidObjectId(id)) {
      throw new BadGatewayException('Not valid id is provided');
    }

    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const productObj = product.toObject();

    if (product.image) {
      try {
        const imageBase64 = await this.getImage(product.image);
        productObj.imageData = imageBase64;
      } catch (error) {
        console.error(
          `Failed to fetch image for product ${product._id}:`,
          error,
        );
      }
    }

    return productObj;
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
    return { message: 'product deleted', data: deletedPost };
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
