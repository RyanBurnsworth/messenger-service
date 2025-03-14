/**
 * Entity for CRUD operations on Supabase Database
 */
export interface MessageEntity {
    /** Sender Id */
    sender: string;

    /** RecipientId */
    recipient: string;

    /** Message text */
    message: string;

    /** Message creation time */
    created_at: string;
}
