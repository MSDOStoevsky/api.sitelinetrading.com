export interface UserFeedback {
    _id: string;
    userId: string;
    feedback: Array<Feedback>;
}

export interface Feedback {
    fromId: string;
    message: string;
}