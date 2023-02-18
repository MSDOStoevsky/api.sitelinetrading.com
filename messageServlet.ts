import express from "express";
import _ from "lodash";
import * as jwt from "jsonwebtoken";
import { MessageServletUtils } from "./MessageServletUtils";

export namespace MessageServlet {
	/**
	 * The servlet base path.
	 */
	export const PATH = "/message";
	
	/**
	 * 
	 */
	export const router = express.Router();

	/**
	 * 
	 */
	router.post("/search", async (request, result) => {
		const token = _.split(request.headers.authorization, " ")[1];
		jwt.verify(token, process.env.BCRYPT_SECRET as string, async (error, decoded) => {
			if ( error !== null || !decoded || typeof decoded === "string") {
				result.status(400).json({ error: "Expired Token Error" });
			} else {
				result.json(await MessageServletUtils.search(decoded.id, request.body));
			}
		});
	});

	/**
     * 
	 */
	router.get("/:id", async (request, result) => {
		const token = _.split(request.headers.authorization, " ")[1];
		jwt.verify(token, process.env.BCRYPT_SECRET as string, async (error, decoded) => {
			if ( error !== null || !decoded || typeof decoded === "string") {
				result.status(400).json({ error: "Expired Token Error" });
			} else {
				const threadId = request.params.id;
				result.json(await MessageServletUtils.getThread(threadId));
			}
		});
	});

	/**
     * 
	 */
	 router.post("/:id", async (request, result) => {
		const token = _.split(request.headers.authorization, " ")[1];
		const requestBody = request.body;

		jwt.verify(token, process.env.BCRYPT_SECRET as string, async (error, decoded) => {
			if ( error !== null || !decoded || typeof decoded === "string") {
				result.status(400).json({ error: "Expired Token Error" });
			} else {
				const userId = decoded.id;
				if ( requestBody.userId !== userId) {
					result.status(400)
				} else {
					const threadId = request.params.id;
					try {
						result.json(await MessageServletUtils.sendMessage(threadId, request.body));
					} catch( error ) {
						result.status(500).json(error);
					}
				}
			}
		});
	});

	/**
     * 
	 */
	router.post("/", async (request, result) => {
		const token = _.split(request.headers.authorization, " ")[1];
		jwt.verify(token, process.env.BCRYPT_SECRET as string, async (error, decoded) => {
			if ( error !== null || !decoded || typeof decoded === "string") {
				result.status(400).json({ error: "Expired Token Error" });
			} else {
				try {
					result.json(await MessageServletUtils.startThread(request.body));
				} catch( error ) {
					result.status(500);
				}
			}
		});
	});
}
