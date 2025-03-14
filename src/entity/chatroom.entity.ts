/**
 * Entity for CRUD operations on Chatroom Database
 */
export interface ChatroomEntity {
    /** Chatroom id */
    id: number;

    /** Timestamp of when chatroom was created */
    created_at: string;
    
    /** The id of user1 */
    user1: string;

    /** The id of user2 */
    user2: string;

    /** The display name for user1 */
    username1: string;

    /** The display name for user2 */
    username2: string;
}
