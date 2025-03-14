import { Controller, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthRequest } from 'src/request/auth.request';
import { SupabaseService } from 'src/service/supabase.service';

@Controller('chatroom')
export class ChatroomController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post()
  async createNewChatroom(
    @Req() request: AuthRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.supabaseService.createChatroom(request.user?.id);
    response.status(200);
  }
}
