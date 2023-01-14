import { MongoClient } from "mongodb";
import * as dotenv from 'dotenv';
dotenv.config();
const MONGO_CONNECTION_URL = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@192.168.1.249:27017/?directConnection=true&serverSelectionTimeoutMS=2000`;

/**
 * The name of this database.
 */
const DATABASE_NAME = "siteline";

/**
 * Wrapper around the mongo client.
 */
export class Mongo {
	/**
	 * Connect to the ADA DB instance.
	 * @returns a mongo DB instance.
	 */
	static async getConnection() {
		return MongoClient.connect(MONGO_CONNECTION_URL);
	}

	/**
	 * Connect to the provided collection.
	 * @param {string} connection - the mongodb connection instance.
	 * @param {string} collectionName - the desired collection name.
	 * @returns a mongo DB instance at a given collection cursor.
	 */
	static async getCollection(connection: MongoClient, collectionName: string) {
		return connection.db(DATABASE_NAME).collection(collectionName);
	}
}