import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessageController } from './controller/message.controller';
import { SupabaseService } from './service/supabase.service';
import { ChatroomController } from './controller/chatroom.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [MessageController, ChatroomController],
  providers: [SupabaseService],
})
export class AppModule {}
