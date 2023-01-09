import { User } from "./User";

export interface Thread {
    _id: string;
    userIds: [string, string];
    chat: Array<Message>
}

export interface StartThread {
    userIds: [string, string];
    initialMessage: Omit<Message, "timestamp">;
}

export interface Message extends Partial<User>{
    userId: string;
    timestamp: number;
    message: string;
}