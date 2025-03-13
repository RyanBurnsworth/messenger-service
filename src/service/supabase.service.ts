import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MessageDTO } from 'src/dto/message.dto';
import { SUPABASE_API_KEY, SUPABASE_URL } from 'src/util/constants';

@Injectable()
export class SupabaseService {
  supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get(SUPABASE_URL),
      this.configService.get(SUPABASE_API_KEY),
    );
  }

  async insertMessage(tableName: string, message: MessageDTO) {
    const { data, error } = await this.supabase.from(tableName).insert([
      {
        sender: message.sender,
        recipient: message.recipient,
        message: message.message,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.log('Error inserting message: ', { error: error });
      throw new InternalServerErrorException(
        'Error inserting message: ',
        error.message,
      );
    }
    return data;
  }
}
