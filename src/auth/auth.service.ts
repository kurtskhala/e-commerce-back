import { BadRequestException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const existUser = await this.usersService.findOneByEmail(signUpDto.email);
    if (existUser) throw new BadRequestException('User already exists');

    const hashedPass = await bcrypt.hash(signUpDto.password, 10);
    await this.usersService.create({ ...signUpDto, password: hashedPass });
    return { message: 'User created successfully' };
  }

  async signIn(signInDto: SignInDto) {
    const existUser = await this.usersService.findOneByEmail(signInDto.email);
    console.log(existUser);

    if (!existUser)
      throw new BadRequestException('Email or password is not correct');

    const isPassEqual = await bcrypt.compare(
      signInDto.password,
      existUser.password,
    );

    if (!isPassEqual)
      throw new BadRequestException('Email or password is not correct');

    const payload = {
      userId: existUser._id,
      role: existUser.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    return { accessToken };
  }

  async getCurrentUser(userId: string) {
    const user = await this.usersService.findOne(userId);
    return user;
  }
}
