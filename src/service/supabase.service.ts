import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ChatroomDTO } from 'src/dto/chatroom.dto';
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
  private readonly supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>(SUPABASE_URL),
      this.configService.get<string>(SUPABASE_API_KEY),
    );

    this.signInAsService();
  }

  /**
   * Inserts a message into the Messages table.
   * @param message The message to insert.
   * @returns The inserted message data.
   */
  async insertMessage(message: MessageDTO) {
    try {
      const { data, error } = await this.supabase.from(MESSAGES).insert([
        {
          senderName: message.senderName,
          senderId: message.senderId,
          message: message.message,
          chatroomId: message.chatroomId,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        throw new InternalServerErrorException(
          `Error inserting message: ${error.message}`,
        );
      }

      return data;
    } catch (error) {
      console.error('Error inserting message:', error);
      throw error;
    }
  }

  /**
   * Creates a chatroom or joins an existing one.
   * @param chatroomDTO User data to join or create a chatroom.
   * @returns The inserted chatroom data or void if joined an existing one.
   */
  async createChatroom(chatroomDTO: ChatroomDTO) {
    try {
      const chatroom = await this.getAvailableChatroom();

      if (chatroom) {
        if (chatroom.user1 === chatroomDTO.userId) return;
        await this.joinChatroom(
          chatroom.id,
          chatroomDTO.userId,
          chatroomDTO.username,
        );
        return;
      }

      const { data, error } = await this.supabase
        .from(CHATROOMS)
        .insert([
          { user1: chatroomDTO.userId, username1: chatroomDTO.username },
        ]);

      if (error) {
        throw new InternalServerErrorException(
          `Error creating chatroom: ${error.message}`,
        );
      }

      return data;
    } catch (error) {
      console.error('Error creating chatroom:', error);
      throw error;
    }
  }

  /**
   * Fetches an available chatroom.
   * @returns The available chatroom entity or null if none available.
   */
  async getAvailableChatroom(): Promise<ChatroomEntity | null> {
    try {
      const { data, error } = await this.supabase
        .from(CHATROOMS)
        .select('*')
        .order('id', { ascending: false })
        .limit(1);

      if (error) {
        throw new InternalServerErrorException(
          `Error fetching chatroom: ${error.message}`,
        );
      }

      const chatroom = data?.[0] as ChatroomEntity;
      return chatroom && !chatroom.user2 ? chatroom : null;
    } catch (error) {
      console.error('Error fetching available chatroom:', error);
      return null;
    }
  }

  /**
   * Joins an available chatroom.
   * @param chatroomId The chatroom ID to join.
   * @param newUser2 The ID of the user joining.
   * @param newUsername2 The username of the joining user.
   */
  async joinChatroom(
    chatroomId: number,
    newUser2: string,
    newUsername2: string,
  ) {
    try {
      const { error } = await this.supabase
        .from(CHATROOMS)
        .update({ username2: newUsername2, user2: newUser2 })
        .eq('id', chatroomId);

      if (error) {
        throw new InternalServerErrorException(
          `Error updating chatroom: ${error.message}`,
        );
      }
    } catch (error) {
      console.error('Error updating chatroom:', error);
      throw error;
    }
  }

  /**
   * Signs the service in as a Supabase user.
   */
  private async signInAsService() {
    try {
      await this.supabase.auth.signOut();
      await this.supabase.auth.signInWithPassword({
        email: this.configService.get<string>(SERVICE_EMAIL),
        password: this.configService.get<string>(SERVICE_PASSWORD),
      });
    } catch (error) {
      console.error('Error signing in as service:', error);
    }
  }
}
