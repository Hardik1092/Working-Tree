export interface ChatParticipant {
    _id: string;
    name?: string;
    avatar?: string;
    profilePhoto?: {
        url?: string;
    };
    [key: string]: unknown;
}
export interface Conversation {
    _id: string;
    type?: 'direct' | 'group';
    participants?: ChatParticipant[];
    lastMessage?: ChatMessage;
    updatedAt: string;
    createdAt?: string;
    [key: string]: unknown;
}
export interface ChatMessage {
    _id: string;
    conversation: string;
    sender: string | ChatParticipant;
    content?: string;
    text?: string;
    media?: {
        url?: string;
        type?: string;
    }[];
    createdAt: string;
    [key: string]: unknown;
}
//# sourceMappingURL=chat.d.ts.map