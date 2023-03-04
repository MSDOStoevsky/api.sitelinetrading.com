import _ from "lodash";
import * as dotenv from 'dotenv';
import { SQLite } from "./Sqlite";
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

export namespace FlagServletUtils {

	export async function flagProduct(flagSettings: { userId: string, productId: string }): Promise<any> {
		const insertedId = uuidv4();
		const stmt = SQLite.prepare('INSERT INTO flags (id, userId, productId) VALUES (?, ?, ?)');
		try {
			stmt.run(insertedId, flagSettings.userId, flagSettings.productId);
			return {
				data: { insertedId: insertedId }
			}
		} catch ( error ) {
			throw error;
		}
	}

	export async function getFlags(userId: string): Promise<any> {
		const stmt = SQLite.prepare('SELECT `productId` FROM flags WHERE userId = ?');
		try {
			return {
				data: stmt.all(userId)
			}
		} catch ( error ) {
			throw error;
		}
	}
}
