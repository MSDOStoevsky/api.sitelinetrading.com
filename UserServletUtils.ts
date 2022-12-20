import { Mongo } from "./Mongo";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from 'uuid';
import { SearchExpression, OrderExpression } from "./models/SearchExpression";
import { Product } from "./models/Product";
import { UserLoginRequest } from "./models/UserLoginRequest";
import { CreateUserRequest } from "./models/CreateUserRequest";
import * as bcrypt from "bcrypt";

/**
 * The name of the mongo collection for this resource
 */
const COLLECTION_NAME = 'user';

export namespace UserServletUtils {

	/**
	 * Get a single user.
	 * @param userId - the unique user ID.
	 */
	export async function getUser(userId: string) {

		const connection = await Mongo.getConnection();
		const sitelineMongo = await Mongo.getCollection(connection, COLLECTION_NAME);

		const userQueryResult = await sitelineMongo.findOne({ "_id": new ObjectId(userId)});

		return {
			data: userQueryResult
		};
	}

	/**
	 * Get a single user.
	 * @param userId - the unique user ID.
	 */
     export async function getMe() {

		const connection = await Mongo.getConnection();
		const sitelineMongo = await Mongo.getCollection(connection, COLLECTION_NAME);

		const userQueryResult = await sitelineMongo.findOne({ "_id": new ObjectId("")});

		return {
			data: userQueryResult
		};
	}

	/**
     * Create a feature document.
     * @param {Record<string, any>} createProductRequest - should look something like this
     * {
            featureName: 'name',
            description: 'name',
            createdBy: 'Placeholder',
            updatedBy: 'Placeholder',
            createdTimestamp: new Date().toISOString(),
            updatedTimestamp: new Date().toISOString()
        }
        @returns a promise that resolves to the insertion of a mongo record.
     */
    export async function login(userLoginRequest: UserLoginRequest) {
		const connection = await Mongo.getConnection();
		const sitelineMongo = await Mongo.getCollection(connection, COLLECTION_NAME);

        console.log(sitelineMongo, userLoginRequest);
        const userQuery = { $or: [{
            "username": userLoginRequest.username
        }] };

        const userResult = await sitelineMongo.findOne(userQuery) as any;
        const isPasswordMatch = await bcrypt.compare(userLoginRequest.password, userResult.password);

        if (!isPasswordMatch) {
            throw Error("Password is incorrect");
        }

        const sessionToken = uuidv4();

        await sitelineMongo.updateOne(userQuery, {$set: {
            "session_token": sessionToken
        }});

        connection.close();
        return {
            status: "success",
            user: userResult,
            sessionToken: uuidv4()
        };
        
    }

	export async function create(createUserRequest: CreateUserRequest) {

        
        const connection = await Mongo.getConnection();
        const collection = await Mongo.getCollection(connection, COLLECTION_NAME);

        const hashedPassword = await bcrypt.hash(createUserRequest.password, 10);

        console.log(hashedPassword);
        try {
            await collection.insertOne(
                {
                    email: createUserRequest.email,
                    username: createUserRequest.username || createUserRequest.email,
                    password: hashedPassword,
                    created_timestamp: new Date()
                }
            );
            return {
                status: "success"
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
}
