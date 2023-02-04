import { Mongo } from "./Mongo";
import { ObjectID, ObjectId } from "mongodb";
import _ from "lodash";
import { SearchExpression } from "./models/SearchExpression";
import { StartThread, Thread } from "./models/Thread";

/**
 * The name of the mongo collection for this resource
 */
const COLLECTION_NAME = 'message';

export namespace MessageServletUtils {
	/**
	 * 
	 */
	export async function search(userId: string, searchRequest: SearchExpression) {
		const defaultMaxPageSize = 1000;

		/**
		 * 
		 */
		const translateFilterExpression = (filterExpression: any) => {
			return _(filterExpression)
				.mapValues((filterValue, key) => {
					if ( key === "userId") {
						return filterValue;
					}
					if ( typeof filterValue === "string" ) {
						return { $regex: `.*${filterValue}.*`, $options: "i" };
					}

					if ( typeof filterValue === "boolean" ) {
						return filterValue;
					}
				})
				.value();
		};

		const connection = await Mongo.getConnection();
		try {
			// Captures events where user omits the desired page size or when
			// the user is stupid and says they want 0 rows per page.
			const pageSize = searchRequest.pageSize || defaultMaxPageSize;

			// Mongo understands pagination by offsetting the results by literal number
			// of records. This translates a single-digit page to its equivalent in row numbers.
			const pageOffset = searchRequest.page >= 1 ? pageSize * searchRequest.page : 0;

			const collection = await Mongo.getCollection(connection, COLLECTION_NAME);

			const searchQuery = collection
				.find(
					{
						"userIds": userId
					},
					{
						limit: pageSize,
						projection: { "chat": 0 }
					}
				)
				.skip(pageOffset);

			const pageInfoQuery = collection.countDocuments(
				{
					"userIds": userId
				},
				{
					limit: pageSize,
					/*sort:
						searchRequest.orderBy &&
						translateSortExpression(searchRequest.orderBy),*/
				});

			const data = await searchQuery.toArray();
			const count = await pageInfoQuery;

			return {
				data: data,
				pageInfo: {
					currentPage: searchRequest.page,
					totalItems: count,
					totalPages: _.ceil(count / pageSize)
				}
			};
		} catch (error) {
			return {
				status: "failure",
				message: error
			};
		} finally {
			connection.close();
		}
	}

	/**
     * 
	 */
	export async function getThread(threadId: string) {

		const connection = await Mongo.getConnection();

		const collection = await Mongo.getCollection(connection, COLLECTION_NAME);

		const productQuery = await collection.findOne<Thread>({ "_id": new ObjectId(threadId)});
		
		if ( productQuery === null) {
			return {
				data: null
			}
		}

		// const userQuery = await collection.findOne({ "_id": new ObjectId(productQuery.userId)});

		return {
			data: {...productQuery}
		};
	}


	/**
	 * 
	 */
	export async function startThread(startThread: StartThread): Promise<any> {

		const initialMessage = startThread.initialMessage;

		if ( !initialMessage || !startThread.userIds) {
			return {
				error: ""
			}
		}
		const connection = await Mongo.getConnection();

		const collection = await Mongo.getCollection(connection, COLLECTION_NAME);

		const query = await collection.insertOne({
			userIds: startThread.userIds,
			chat: [
				{
					timestamp: Date.now(),
					message: initialMessage.message,
					userId: initialMessage.userId
				}
			]
		});

		return {
			data: query
		};
	}

	/**
	 * 
	 */
	export async function sendMessage(threadId: string, body: { message: string, userId: string }): Promise<any> {
		const connection = await Mongo.getConnection();

		const collection = await Mongo.getCollection(connection, COLLECTION_NAME);

		const productQuery = await collection.updateOne({ _id: new ObjectId(threadId) }, { 
			$push: { 
					chat: {
						userId: body.userId,
						timestamp: Date.now(),
						message: body.message
					}
				}
		});

		return {
			data: productQuery
		};
	}
}
