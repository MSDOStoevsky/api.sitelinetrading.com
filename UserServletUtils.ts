import { Mongo } from "./Mongo";
import { Filter, ObjectId, Document } from "mongodb";
import { v4 as uuidv4 } from 'uuid';
import * as jwt from "jsonwebtoken";
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
     * 
	 */
	export async function getUser(userId: string) {

		const connection = await Mongo.getConnection();
		const sitelineMongo = await Mongo.getCollection(connection, COLLECTION_NAME);

		const userQueryResult = await sitelineMongo.findOne({ "_id": new ObjectId(userId)});

		return userQueryResult ? {
			data: {
                userId: userQueryResult._id,
                displayName: userQueryResult.displayName
            }
		} : null;
	}

    /**
     * 
	 */
	export async function getUsers(userIds: Array<string>) {

		const connection = await Mongo.getConnection();
		const sitelineMongo = await Mongo.getCollection(connection, COLLECTION_NAME);
		const userQueryResult = await sitelineMongo.find({ "_id": { $in: userIds.map((id) => new ObjectId(id)) } }, { projection: { "_id": 1, "displayName": 1 } }).toArray();
        
		return userQueryResult ? {
			data: userQueryResult
		} : null;
	}

	/**
     * 
	 */
	export async function getMe(userId: string) {

		const connection = await Mongo.getConnection();
		const sitelineMongo = await Mongo.getCollection(connection, COLLECTION_NAME);

		const userQueryResult = await sitelineMongo.findOne({ "_id": new ObjectId(userId)});

		return userQueryResult ? {
			data: {
                userId: userQueryResult._id,
                displayName: userQueryResult.displayName,
                createdTimestamp: userQueryResult.createdTimestamp,
                emailPreferences: userQueryResult.emailPreferences
            }
		} : null;
	}

	/**
     * 
     */
    export async function login(userLoginRequest: UserLoginRequest) {
		const connection = await Mongo.getConnection();
		const sitelineMongo = await Mongo.getCollection(connection, COLLECTION_NAME);

        const userQuery: Filter<Document> = { $or: [
            {"displayName": userLoginRequest.accountIdOrDisplayName}
        ] }
        try { 
            userQuery.$or.push( {"_id": new ObjectId(userLoginRequest.accountIdOrDisplayName)} ) ;
        } catch (error) {
            console.log("this couldn't possibly be an ID");
        } 
        const userResult = await sitelineMongo.findOne(userQuery) as any;

        if (!userResult) {
            return {
                status: "error",
                message: "Something is wrong with either the account ID or password"
            }
        }

        const isPasswordMatch = await bcrypt.compare(userLoginRequest.password, userResult.password);
        connection.close();

        if (!isPasswordMatch) {
            return {
                status: "error",
                message: "password is incorrect"
            }
        }
        

        try {
            const token = jwt.sign({ id: `${userResult._id}`, password: userLoginRequest.password}, 'shhhhh', {
                expiresIn: "24h"
            });
            return {
                status: "success",
                token
            };
        } catch(error) {
            console.log(error);
        }
        
    }

    /**
     * 
     */
	export async function create(createUserRequest: CreateUserRequest) {
        const connection = await Mongo.getConnection();
        const collection = await Mongo.getCollection(connection, COLLECTION_NAME);

        const hashedPassword = await bcrypt.hash(createUserRequest.password, 10);

        try {
            const result = await collection.insertOne(
                {
                    displayName: createUserRequest.displayName,
                    password: hashedPassword,
                    createdTimestamp: Date.now(),
                    emailPreferences: "none"
                }
            );
            return {
                status: "success",
                token: jwt.sign({id: `${result.insertedId}`, password: createUserRequest.password}, 'shhhhh', {
                    expiresIn: "24h"
                })
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
