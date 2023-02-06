import { Mongo } from "./Mongo";
import { ObjectId } from "mongodb";
import { Feedback, UserFeedback } from "./models/Feedback";
import { User } from "./models/User";
import _ from "lodash";

/**
 * The name of the mongo collection for this resource
 */
const COLLECTION_NAME = 'feedback';

export namespace FeedbackServletUtil {

	/**
     * 
	 */
	export async function getUserFeedback(userId: string) {
		let connection;
		try {
			connection = await Mongo.getConnection();
		} catch (error) {
			return {
				status: "failure",
				message: error
			};
		}
		const collection = await Mongo.getCollection(connection, COLLECTION_NAME);
		const userCollection = await Mongo.getCollection(connection, "users");

		const feedbackQueryResult = await collection.findOne<UserFeedback>({ "userId": userId });
		if ( !feedbackQueryResult ) {
			return {
				data: []
			}
		}

		const feedbackWithDisplayName = {
			...feedbackQueryResult, 
			feedback: await Promise.all(feedbackQueryResult.feedback.map(async (userPost) => {
				const userResult = await userCollection.findOne<User>({ _id: new ObjectId(userPost.fromId) });
				return {
					...userPost,
					fromDisplayName: userResult || null
				}
			}))
		};

		return {
			data: feedbackWithDisplayName
		};
	}

	/**
     * 
	 */
	export async function postUserFeedback(id: string | undefined, newFeedback: Feedback) {
		let connection;
		try {
			connection = await Mongo.getConnection();
		} catch (error) {
			return {
				status: "failure",
				message: error
			};
		}
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
				feedback: {...newFeedback}
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
		let connection;
		try {
			connection = await Mongo.getConnection();
		} catch (error) {
			return {
				status: "failure",
				message: error
			};
		}
		const collection = await Mongo.getCollection(connection, COLLECTION_NAME);
		const { userId, ...newFeedback } = feedback;

		return await collection.insertOne({ _id: new ObjectId() , userId: userId, feedback: [ newFeedback ] });
	}
}
