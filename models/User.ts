/**
 * The definition of a User
 */
 export interface User {
	/**
	 * The unique user Id.
	 */
	_id: string;
	/**
	 * The user's linked email address.
	 */
	email: string;
	/**
	 * The user's username.
	 */
	username: string;
	/**
	 * The timestamp of when the user created their account.
	 */
	created_timestamp: string;
	/**
	 * 
	 */
	settings?: UserSettings;

    feedback: Array<Feedback>;
}

export interface UserSettings {
	email_notifications: boolean;
}

export interface Feedback {
    userId: string;
    
    message: string;
}