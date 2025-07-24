import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Define the authenticated request interface
interface AuthenticatedRequest extends Request {
  userId: string;
  role?: string;
}

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.userId;
  },
);
