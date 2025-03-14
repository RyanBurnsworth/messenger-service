import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { SupabaseService } from '../service/supabase.service';
import { AuthRequest } from 'src/request/auth.request';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly supabaseService: SupabaseService) {}

  async use(req: AuthRequest, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token || token === '') return;

    const user = await this.supabaseService.getSupabaseUser(token, true);
    req.user = user;
    next();
  }
}
