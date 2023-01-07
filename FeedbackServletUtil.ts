import { Mongo } from "./Mongo";
import { ObjectId } from "mongodb";
import { Feedback, UserFeedback } from "./models/Feedback";

/**
 * The name of the mongo collection for this resource
 */
const COLLECTION_NAME = 'feedback';

export namespace FeedbackServletUtil {

	/**
     * 
	 */
	export async function getUserFeedback(userId: string) {
		const connection = await Mongo.getConnection();
		const collection = await Mongo.getCollection(connection, COLLECTION_NAME);

		const feedbackQueryResult = await collection.findOne({ "userId": userId });

		return {
			data: feedbackQueryResult || []
		};
	}

	/**
     * 
	 */
	export async function postUserFeedback(id: string | undefined, newFeedback: Feedback) {
		const connection = await Mongo.getConnection();
		const collection = await Mongo.getCollection(connection, COLLECTION_NAME);
 
		const userFeedbackFindQueryResult = await collection.findOne<UserFeedback>({ _id: new ObjectId(id) });

		if ( !userFeedbackFindQueryResult ) {
			return null;
		}

		const userAlreadyPosted = userFeedbackFindQueryResult.feedback.some((n) => { return n.fromId === newFeedback.fromId });

		if ( userAlreadyPosted ) {
			return {
				status: "failure",
				message: "User has already posted"
			};
		}
		
		const userFeedbackUpdateQueryResult = await collection.updateOne({ _id: new ObjectId(id) }, {
			$push: {
				feedback: newFeedback
			}
		});
		return userFeedbackUpdateQueryResult;
	}


	/**
     * 
	 */
	export async function startUserFeedback(feedback: {
		fromId: string;
		message: string;
		userId: string;
	}) {
		const connection = await Mongo.getConnection();
		const collection = await Mongo.getCollection(connection, COLLECTION_NAME);
		const { userId, ...newFeedback } = feedback;

		return await collection.insertOne({ _id: new ObjectId() , userId: userId, feedback: [ newFeedback ] });
	}
}
