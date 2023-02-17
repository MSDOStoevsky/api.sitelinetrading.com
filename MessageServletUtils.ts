import _ from "lodash";
import { SearchExpression } from "./models/SearchExpression";
import { StartThread } from "./models/Thread";
import { v4 as uuidv4 } from 'uuid';
import { SQLite } from "./Sqlite";
import { packIntoArray } from "./utils/packIntoArray";


export namespace MessageServletUtils {
	/**
	 * 
	 */
	export async function search(userId: string, searchRequest: SearchExpression) {
		const translateFilterExpression = (filterExpression: any) => {
			return _(filterExpression).pickBy((filterValue) => {
				return !!filterValue;
			}).map((filterValue, key) => {
					if ( key === "userId") {
						return `${key} = '${filterValue}'`
					}

					if ( typeof filterValue === "string" ) {
						return `${key} LIKE '%${filterValue}%'`;
					}
				}).value();
		};

		try {
			const pageEnd = (searchRequest.page + 1) * searchRequest.pageSize;
			const pageStart = pageEnd - searchRequest.pageSize;
			// const orderString = searchRequest.orderBy ? `${searchRequest.orderBy.field} ${searchRequest.orderBy.order}` : "createdTimestamp DESC";
			const filterExpression = translateFilterExpression(searchRequest.filterExpression);
			const searchResults = SQLite.prepare(`SELECT id, userId1, displayName, userId2, displayName2
			FROM    ( SELECT    ROW_NUMBER() OVER ( ORDER BY thread.id DESC ) AS RowNum, thread.id, thread.userId1, user1.displayName, thread.userId2, user2.displayName as displayName2
					  FROM      thread
					  LEFT JOIN user as user1 ON thread.userId1 = user1.id 
					  LEFT JOIN user as user2 ON thread.userId2 = user2.id
					  WHERE thread.userId1 = '${userId}' OR thread.userId2 = '${userId}'
					  GROUP BY thread.id
					) AS RowConstrainedResult
			WHERE   RowNum >= ${pageStart}
				AND RowNum < ${pageEnd}
			ORDER BY RowNum`).get();

			const totalItems = SQLite.prepare(`SELECT COUNT(*) as numberOfItems from thread`).get().numberOfItems;
			return {
				data:  packIntoArray(searchResults),
				pageInfo: {
					totalItems,
					currentPage: searchRequest.page,
					totalPages: _.ceil(totalItems / searchRequest.pageSize)
				}
			}
		} catch ( error ) {
			throw error;
		}
	}

	export async function getThread(threadId: string) {
		const messages = SQLite.prepare(
			`SELECT message.id, message.userId, message.timestamp, threadId, displayName, message FROM message 
			LEFT JOIN user on message.userId = user.id 
			WHERE threadId = ? 
			ORDER BY timestamp DESC;`
			).all(threadId);
		try {
			return {
				data: packIntoArray(messages)
			}
		} catch ( error ) {
			throw error;
		}
	}

	export async function startThread(startThread: StartThread): Promise<any> {
		const threadId = uuidv4();
		const messageId = uuidv4();
		try {
			const thread = SQLite.prepare('INSERT INTO thread (id, userId1, userId2) VALUES (?,?,?)');
			const message = SQLite.prepare('INSERT INTO message (id, threadId, message, userId, timestamp) VALUES (?,?,?,?,?)');
			thread.run(threadId, startThread.myId, startThread.userId);
			message.run(messageId, threadId, startThread.initialMessage, startThread.myId, Date.now());
			return {
				data: { threadId }
			}
		} catch ( error ) {
			throw error;
		}
	}

	export async function sendMessage(threadId: string, body: { message: string, userId: string }): Promise<any> {
		const insertedId = uuidv4();
		const stmt = SQLite.prepare('INSERT INTO message (id, threadId, message, userId, timestamp) VALUES (?,?,?,?,?)');
		try {
			stmt.run(insertedId, threadId, body.message, body.userId, Date.now());
			return {
				data: { insertedId }
			}
		} catch ( error ) {
			throw error;
		}
	}
}
