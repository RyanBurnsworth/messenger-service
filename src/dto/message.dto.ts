/**
 * Data Transfer Object for handling Message data
 */
export interface MessageDTO {
    senderName: string;

    senderId: string;

    message: string;

    chatroomId: number;
}
