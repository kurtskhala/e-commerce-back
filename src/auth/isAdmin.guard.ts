import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

interface AuthenticatedRequest extends Request {
  userId?: string;
  role?: string;
}
@Injectable()
export class IsAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const request = context.switchToHttp().getRequest() as AuthenticatedRequest;
    const role = request.role;
    if (role != 'admin') {
      throw new BadRequestException('Permission denied');
    }
    return true;
  }
}
