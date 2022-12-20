import { User } from "./User";

export interface Thread {
    _id: string;

    chat: Array<Message>
}


export interface Message extends Partial<User>{
    userId: string;
    timestamp: number;
    message: string;
}

export interface SentMessage {
    
}