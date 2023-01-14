import express from "express";
import _ from "lodash";
import * as jwt from "jsonwebtoken";
import { UserServletUtils } from "./UserServletUtils";
import { isBadRequest } from "./utils/isBadRequest";

export namespace UserServlet {
	/**
	 * 
	 */
	export const PATH = "/user";
	/**
	 * 
	 */
	export const router = express.Router();

	/**
	 * 
	 */
	router.get("/me", async (request, result) => {
		if (isBadRequest(request)) {
			result.status(400);
		}
		const token = _.split(request.headers.authorization, " ")[1];
		jwt.verify(token, "shhhhh", async (error, decoded) => {
			if ( error !== null || !decoded || typeof decoded === "string") {
				result.status(400).json({ error: "Expired Token Error" });
			} else {
				const userId = decoded.id;
				const user = await UserServletUtils.getMe(userId);
				if (!user) {
					result.status(500).json({ status: "error"});
				}
				result.json(user);
			}
		});
	});

	/**
	 * 
	 */
	router.get("/:id", async (request, result) => {
		if (isBadRequest(request)) {
			result.status(400);
		}
		const token = _.split(request.headers.authorization, " ")[1];
		
		jwt.verify(token, "shhhhh", async (error, decoded) => {
			if ( error !== null || !decoded || typeof decoded === "string") {
				result.status(400).json({ error: "Expired Token Error" });
			} else {
				const userId = request.params.id;
				result.json(await UserServletUtils.getUser(userId));
			}
		});
	});

	/**
	 * 
	 */
	router.post("/batch", async (request, result) => {
		if (isBadRequest(request)) {
			result.status(400);
		}
		const token = _.split(request.headers.authorization, " ")[1];
		jwt.verify(token, "shhhhh", async (error, decoded) => {
			if ( error !== null || !decoded || typeof decoded === "string") {
				result.status(400).json({ error: "Expired Token Error" });
			} else {
				result.json(await UserServletUtils.getUsers(request.body?.userIds));
			}
		});
	});

	/**
	 * 
	 */
	router.post("/login", async ( request, result) => {
		try {
			const loginResult = await UserServletUtils.login(request.body);
            result.json(loginResult);
		} catch(error) {
			result.status(500).json({ meesage: error });
		}
	});


	/**
	 * 
	 */
	router.post("/", async ( request, result) => {
		try {
			const createResult = await UserServletUtils.create(request.body);
            result.status(200).json(createResult);
		} catch(error) {
			result.status(500).json(error);
		}
	});
}
