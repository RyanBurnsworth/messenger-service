import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessageController } from './controller/message.controller';
import { SupabaseService } from './service/supabase.service';
import { AuthMiddleware } from './auth/auth.middleware';
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // allow only the messenger-service to use ChatroomController
    consumer.apply(AuthMiddleware).forRoutes(ChatroomController)
  }
}
