import { v4 as uuidv4 } from 'uuid';
import _ from "lodash";
import { SQLite } from "./Sqlite";

/**
 * The name of the mongo collection for this resource
 */
const COLLECTION_NAME = 'feedback';

export namespace FeedbackServletUtil {

	export async function getUserFeedback(userId: string) {
	
		const selectFeedback = SQLite.prepare('SELECT * FROM feedback WHERE userId = ?');
		try {
			;
			return {
				data: selectFeedback.all(userId)
			}
		} catch ( error ) {
			throw error;
		}
	}

	export async function postUserFeedback(newFeedback: {
		fromId: string;
		message: string;
		userId: string;
	}) {

		const selectFeedback = SQLite.prepare('SELECT * FROM feedback WHERE userId = ? AND fromId = ?').get(newFeedback.userId, newFeedback.fromId);


		if ( !_.isEmpty(selectFeedback) ) { 
			throw {
				status: "failure",
				message: "User has already posted"
			};
		}

		const insertedId = uuidv4();
		const insertIntoFeedback = SQLite.prepare('INSERT INTO feedback (id, userId, fromId, message, timestamp) VALUES (?,?,?,?,?)');
		try {
			insertIntoFeedback.run(insertedId, newFeedback.userId, newFeedback.fromId, newFeedback.message, Date.now());
			return {
				data: { insertedId }
			}
		} catch ( error ) {
			throw error;
		}
	}
}
