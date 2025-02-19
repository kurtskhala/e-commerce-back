import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { isValidObjectId, Model } from 'mongoose';
import { User } from './schema/user.schema';
import { Product } from 'src/products/schema/product.schema';
import { EmailSenderService } from 'src/email-sender/email-sender.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private emailSenderService: EmailSenderService,
  ) {}

  findAll() {
    return this.userModel.find();
  }

  async findOneByEmail(email: string) {
    const user = await this.userModel
      .findOne({ email })
      .select('password role');
    return user;
  }

  async findOne(id) {
    if (!isValidObjectId(id))
      throw new BadGatewayException('Not valid id is provided');

    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(body) {
    const existUser = await this.userModel.findOne({
      email: body.email,
    });
    if (existUser) throw new BadGatewayException('user already exists');
    const user = await this.userModel.create(body);
    return user;
  }

  async remove(id: mongoose.Schema.Types.ObjectId) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const deletedUser = await this.userModel.findByIdAndDelete(id);
    return { message: 'user deleted', data: deletedUser };
  }

  async update(id, body) {
    if (!isValidObjectId(id))
      throw new BadGatewayException('Not valid id is provided');
    const { role, ...updateData } = body;
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return { message: 'user updated successfully', data: updatedUser };
  }

  async updateRole(id, role: 'user' | 'editor' | 'admin') {
    if (!isValidObjectId(id)) {
      throw new BadGatewayException('Not valid id is provided');
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { role },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return {
      message: 'User role updated successfully',
      data: updatedUser,
    };
  }

  async addToCart(userId, productId, quantity) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (Number(product.quantity) < Number(quantity)) {
      throw new BadRequestException('Not enough product in stock');
    }

    const existingCartItem = user.cart.find(
      (item) => item.productId.toString() === productId,
    );

    if (existingCartItem) {
      if (
        Number(product.quantity) <
        Number(existingCartItem.quantity) + Number(quantity)
      ) {
        throw new BadRequestException('Not enough product in stock');
      }
      existingCartItem.quantity = (
        Number(existingCartItem.quantity) + Number(quantity)
      ).toString();
    } else {
      user.cart.push({
        productId,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    await user.save();
    return { message: 'Product added to cart', data: user.cart };
  }

  async removeFromCart(userId, productId, quantity) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const cartItemIndex = user.cart.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (cartItemIndex === -1) {
      throw new NotFoundException('Product not found in cart');
    }

    const cartItem = user.cart[cartItemIndex];

    if (quantity > cartItem.quantity) {
      throw new BadRequestException('Removal quantity exceeds cart quantity');
    }

    if (quantity === cartItem.quantity) {
      user.cart.splice(cartItemIndex, 1);
    } else {
      cartItem.quantity = (Number(cartItem.quantity) - quantity).toString();
    }

    await user.save();
    return { message: 'Product removed from cart', data: user.cart };
  }

  async checkout(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.cart.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let total = '0';
    const productUpdates: any = [];

    for (const cartItem of user.cart) {
      const product = await this.productModel.findById(cartItem.productId);

      if (!product) {
        throw new NotFoundException(`Product ${cartItem.productId} not found`);
      }

      if (Number(product.quantity) < Number(cartItem.quantity)) {
        throw new BadRequestException(
          `Not enough stock for product: ${product.name}`,
        );
      }

      total = (
        Number(total) +
        Number(cartItem.price) * Number(cartItem.quantity)
      ).toString();
      const productQuantity =
        Number(product.quantity) - Number(cartItem.quantity);
      await this.productModel.findByIdAndUpdate(
        product._id,
        { quantity: productQuantity },
        {
          new: true,
        },
      );
    }

    const order = {
      items: [...user.cart],
      total,
      date: new Date(),
    };

    user.orderHistory.push(order);
    user.cart = [];
    await user.save();

    await this.emailSenderService.sendTextToEmail(
      user.email,
      "Order History",
      order
    );

    return {
      message: 'Order placed successfully',
      data: order,
    };
  }
}
