import express from "express";
import _ from "lodash";
import { MessageServletUtils } from "./MessageServletUtils";

export namespace MessageServlet {
	/**
	 * The servlet base path.
	 */
	export const PATH = "/message";
	
	/**
	 * The router associated with this servlet.
	 */
	export const router = express.Router();

	/**
	 * The global product search endpoint
	 */
	router.post("/search", async (request, result) => {
		result.json(await MessageServletUtils.search(request.body));
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
}
