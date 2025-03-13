import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessageController } from './controller/message.controller';
import { SupabaseService } from './service/supabase.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [MessageController],
  providers: [SupabaseService],
})
export class AppModule {}
