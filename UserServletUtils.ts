import { Mongo } from "./Mongo";
import { Filter, ObjectId, Document } from "mongodb";
import * as jwt from "jsonwebtoken";
import { UserLoginRequest } from "./models/UserLoginRequest";
import { CreateUserRequest } from "./models/CreateUserRequest";
import * as bcrypt from "bcrypt";
import { SQLite } from "./Sqlite";
import { v4 as uuidv4 } from 'uuid';

/**
 * The name of the mongo collection for this resource
 */
const COLLECTION_NAME = 'user';

export namespace UserServletUtils {

	export async function getUser(userId: string) {
		const stmt = SQLite.prepare('SELECT id, displayName FROM user WHERE id = ?;');
		try {
			return {
				data: stmt.get(userId) || null
			}
		} catch ( error ) {
			throw error;
		}
	}

	export async function getUsers(userIds: Array<string>) {
		const stmt = SQLite.prepare('SELECT id, displayName FROM user WHERE id = ?;');
		try {
			return {
				data: stmt.get(...userIds) || null
			}
		} catch ( error ) {
			throw error;
		}
	}

	export async function getMe(userId: string) {
		try {
            const stmt = SQLite.prepare('SELECT id, displayName, createdTimestamp, emailPreferences FROM user WHERE id = ?;');
			return {
				data: stmt.get(userId) || null
			}
		} catch ( error ) {
			throw error;
		}
	}

    export async function login(userLoginRequest: UserLoginRequest) {
        let userResult;
        try {
            userResult = SQLite.prepare('SELECT * FROM user WHERE id = ? OR displayName = ?;').get(userLoginRequest.accountIdOrDisplayName, userLoginRequest.accountIdOrDisplayName);
        
            if (!userResult) {
                return {
                    status: "error",
                    message: "Something is wrong with either the account ID or password"
                }
            }

            const isPasswordMatch = await bcrypt.compare(userLoginRequest.password, userResult.password);

            if (!isPasswordMatch) {
                return {
                    status: "error",
                    message: "password is incorrect"
                }
            }
        } catch(error) {
            throw error;
        }
        

        try {
            const token = jwt.sign({ id: `${userResult.id}`, password: userLoginRequest.password}, process.env.BCRYPT_SECRET as string, {
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

	export async function create(createUserRequest: CreateUserRequest) {
        const hashedPassword = await bcrypt.hash(createUserRequest.password, 10);

		const insertedId = uuidv4();
		try {
            const stmt = SQLite.prepare('INSERT INTO user (id, displayName, email, password, createdTimestamp) VALUES (?,?,?,?,?)');
			stmt.run(insertedId, createUserRequest.displayName, undefined, hashedPassword, Date.now());
			return {
                status: "success",
                token: jwt.sign({id: insertedId, password: createUserRequest.password}, process.env.BCRYPT_SECRET as string, {
                    expiresIn: "24h"
                })
            }
		} catch ( error ) {
            console.log(error);
			throw error;
		}
    }
}
