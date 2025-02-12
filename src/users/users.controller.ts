import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { IsValidMongoId } from './dto/isValidMongoId.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from './user.decorator';
import { IsAdminGuard } from 'src/auth/isAdmin.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.findAll();
  }

  @Put('')
  @UseGuards(AuthGuard)
  updateUser(@User() userId, @Body() body: UpdateUserDto) {
    return this.usersService.update(userId, body);
  }

  @Delete('')
  @UseGuards(AuthGuard)
  deleteuser(@User() userId) {
    return this.usersService.remove(userId);
  }

  @Put(':id/role')
  @UseGuards(AuthGuard, IsAdminGuard)
  updateUserRole(
    @Param() { id }: IsValidMongoId,
    @Body('role') role: 'user' | 'editor' | 'admin',
  ) {
    return this.usersService.updateRole(id, role);
  }

  @Put('add-to-cart')
  @UseGuards(AuthGuard)
  addToCart(
    @User() userId,
    @Body() body: { productId: string; quantity: string },
  ) {
    const { productId, quantity } = body;
    return this.usersService.addToCart(userId, productId, quantity);
  }

  @Put('remove-from-cart')
  @UseGuards(AuthGuard)
  removeFromCart(
    @User() userId,
    @Body() body: { productId: string; quantity: string },
  ) {
    const { productId, quantity } = body;
    return this.usersService.removeFromCart(userId, productId, quantity);
  }

  @Post('checkout')
  @UseGuards(AuthGuard)
  checkout(@User() userId: string) {
    return this.usersService.checkout(userId);
  }
}
