import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MessageDTO } from 'src/dto/message.dto';
import { ChatroomEntity } from 'src/entity/chatroom.entity';
import {
  CHATROOMS,
  MESSAGES,
  SERVICE_EMAIL,
  SERVICE_PASSWORD,
  SUPABASE_API_KEY,
  SUPABASE_URL,
} from 'src/util/constants';

@Injectable()
export class SupabaseService {
  supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get(SUPABASE_URL),
      this.configService.get(SUPABASE_API_KEY),
    );
  }

  /**
   * Insert a message into the Messages table
   *
   * @param message the message to insert
   * @returns       the result of the insertation
   */
  async insertMessage(message: MessageDTO) {
    const { data, error } = await this.supabase.from(MESSAGES).insert([
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

  /**
   * Create a chatroom by creating a row in the Chatrooms table
   *
   * @param userId the id of the user creating the chatroom
   * @returns      the result of the insertation
   */
  async createChatroom(userId: string) {
    const chatroom = await this.getAvailableChatroom();

    if (chatroom) {
      if (chatroom.user1 === userId) {
        // this is the room the current user is in
        return;
      } else {
        // the room is available to join
        await this.joinChatroom(chatroom.id, userId);
        return;
      }
    }

    // create a new chatroom
    const { data, error } = await this.supabase.from(CHATROOMS).insert([
      {
        user1: userId,
        user2: '',
      },
    ]);

    if (error) {
      console.log('Error creating chatroom: ', { error: error });

      throw new InternalServerErrorException(
        'Error creating chatroom: ',
        error.message,
      );
    }
    return data;
  }

  /**
   * Fetch an available chatroom
   *
   * @param userId the id of the current user
   * @return       the available chatroom entity or null if none available
   */
  async getAvailableChatroom(): Promise<ChatroomEntity | null> {
    const { data, error } = await this.supabase
      .from(CHATROOMS)
      .select('*')
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last row:', error);
      return null;
    }

    const chatroom = data[0] as ChatroomEntity;

    // if user2 is empty, user1 will exist and this chat can be joined.
    if (chatroom.user2 === '') {
      return chatroom;
    }

    return null;
  }

  /**
   * Join an available chatroom
   *
   * @param chatroomId the id of the existing chatroom
   * @param newUser2   the id of the user joining
   */
  async joinChatroom(chatroomId: number, newUser2: string) {
    const { error } = await this.supabase
      .from(CHATROOMS)
      .update({ user2: newUser2 })
      .eq('id', chatroomId);

    if (error) {
      console.error('Error updating chatroom:', error);
      throw new InternalServerErrorException('Error updating chatroom');
    }
  }

  /**
   * Get a Superbase User
   *
   * @param token   the service auth token
   * @param isAdmin is admin user
   * @returns       a Supabase user
   */
  async getSupabaseUser(token: string, isAdmin: boolean) {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      console.log('Error using auth token: ', error.message);

      // if is the admin service, then sign in and return admin user
      if (isAdmin) {
        await this.supabase.auth.signOut();

        const {
          data: { user },
        } = await this.supabase.auth.signInWithPassword({
          email: this.configService.get(SERVICE_EMAIL),
          password: this.configService.get(SERVICE_PASSWORD),
        });

        return user;
      }

      throw new UnauthorizedException('User auth token is invalid or expired');
    }

    return user;
  }
}
