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
		jwt.verify(token, "shhhhh", async (error, decoded) => {
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
		const threadId = request.params.id;
		result.json(await MessageServletUtils.getThread(threadId));
	});

	/**
     * 
	 */
	 router.post("/:id", async (request, result) => {
		const threadId = request.params.id;
		result.json(await MessageServletUtils.sendMessage(threadId, request.body));
	});

	/**
     * 
	 */
	router.post("/", async (request, result) => {
		result.json(await MessageServletUtils.startThread(request.body));
	});
}
