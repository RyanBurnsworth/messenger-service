import { Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { SupabaseService } from 'src/service/supabase.service';

@Controller('chatroom')
export class ChatroomController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post()
  async createNewChatroom(@Res({ passthrough: true }) response: Response) {
    await this.supabaseService.createChatroom('sdf');
    response.status(200);
  }
}
