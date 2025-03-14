import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ChatroomDTO } from 'src/dto/chatroom.dto';
import { SupabaseService } from 'src/service/supabase.service';

@Controller('chatroom')
export class ChatroomController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post()
  async createNewChatroom(@Res({ passthrough: true }) response: Response, @Body() chatroomDTO: ChatroomDTO) {
    await this.supabaseService.createChatroom(chatroomDTO);
    response.status(200);
  }
}
