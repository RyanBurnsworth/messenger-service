import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { MessageDTO } from 'src/dto/message.dto';
import { SupabaseService } from 'src/service/supabase.service';
import { INTERNAL_SERVER_ERROR, OK } from 'src/util/constants';

@Controller('message')
export class MessageController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post()
  async submitMessage(
    @Res() response: Response,
    @Body() messageDTO: MessageDTO,
  ) {
      const data = await this.supabaseService.insertMessage(messageDTO);
      response.status(OK).json(data);
  }
}
