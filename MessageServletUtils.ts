import { Mongo } from "./Mongo";
import { ObjectID, ObjectId } from "mongodb";
import _ from "lodash";
import { SearchExpression, OrderExpression } from "./models/SearchExpression";
import { Message, Thread } from "./models/Thread";

/**
 * The name of the mongo collection for this resource
 */
const COLLECTION_NAME = 'message';

export namespace MessageServletUtils {
	/**
	 * Performs a "search" on the feature collection.
	 * @param {*} searchRequest - search request.
	 * @returns a promise that resolves to the paginated data.
	 */
	export async function search(searchRequest: SearchExpression) {
		const defaultMaxPageSize = 1000;

		/**
		 * Translates an ADA sort expression to something more mongo friendly.
		 * @param {*} sortExpression - the ada sort expression
		 * @returns mongo "sort" parameters.
		 */
		const translateSortExpression = (sortExpression: OrderExpression) => {
			return {
				[sortExpression.field]:
					sortExpression.order === "ASC" ? -1 : sortExpression.order === "DESC" ? 1 : -1
			};
		};

		/**
		 * Translates an ADA filter expression to something more mongo friendly.
		 * @param {*} the ada filter expression
		 * @returns mongo "find" parameters.
		 */
		const translateFilterExpression = (filterExpression: any) => {
			return _(filterExpression)
				.mapValues((filterValue) => {
					`.*${filterValue}.*`;
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

			const sitelineMongo = await Mongo.getCollection(connection, COLLECTION_NAME);

			const productSearchQuery = sitelineMongo
				.find(
					searchRequest.filterExpression
						? translateFilterExpression(searchRequest.filterExpression)
						: {},
					{
						/*sort:
							searchRequest.orderBy &&
							translateSortExpression(searchRequest.orderBy),*/
						limit: pageSize
					}
				)
				.skip(pageOffset);

			const pageInfoQuery = sitelineMongo.countDocuments(
				searchRequest.filterExpression
					? translateFilterExpression(searchRequest.filterExpression)
					: {},
				{
					/*sort:
						searchRequest.orderBy &&
						translateSortExpression(searchRequest.orderBy),*/
				});

			const data = await productSearchQuery.toArray();
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

		const sitelineMongo = await Mongo.getCollection(connection, COLLECTION_NAME);

		const productQuery = (await sitelineMongo.findOne<Thread>({ "_id": new ObjectId(threadId)}));
		
		if ( productQuery === null) {
			return {
				data: null
			}
		}

		// const userQuery = await sitelineMongo.findOne({ "_id": new ObjectId(productQuery.userId)});

		return {
			data: {...productQuery}
		};
	}


	/**
	 * Add a single order.
	 * @param shopId - the shop ID.
	 * @param productForPost - the product details to be created.
	 */
	export async function sendMessage(threadId: string, body: { message: string}): Promise<any> {
		const connection = await Mongo.getConnection();

		const sitelineMongo = await Mongo.getCollection(connection, COLLECTION_NAME);

		const productQuery = await sitelineMongo.updateOne({ _id: new ObjectId(threadId) }, { $push: { chat: {
            userId: "",
            timestamp: Date.now(),
            message: body.message
        }} }, {
            upsert: true
        });

		return {
			data: productQuery
		};
	}
}
