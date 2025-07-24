import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

// Define the JWT payload structure
interface JwtPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Extend the Request interface to include our custom properties
interface AuthenticatedRequest extends Request {
  userId?: string;
  role?: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.getToken(request.headers);

    if (!token) throw new UnauthorizedException();

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      request.userId = payload.userId;
      request.role = payload.role;
    } catch (e) {
      console.error('JWT verification failed:', e);
      throw new UnauthorizedException();
    }
    return true;
  }

  private getToken(
    headers: Record<string, string | string[] | undefined>,
  ): string | null {
    if (!headers['authorization']) return null;

    const authHeader = headers['authorization'];
    if (typeof authHeader !== 'string') return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
