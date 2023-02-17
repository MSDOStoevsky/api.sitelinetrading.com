import express from "express";
import _ from "lodash";
import { FeedbackServletUtil } from "./FeedbackServletUtil";
import { isBadRequest } from "./utils/isBadRequest";

export namespace FeedbackServlet {
	/**
	 * 
	 */
	export const PATH = "/feedback";
	/**
	 * 
	 */
	export const router = express.Router();

	/**
	 * 
	 */
	router.get("/:id", async (request, result) => {
		if (isBadRequest(request)) {
			result.status(400);
		}
		const userId = request.params.id;
		result.json(await FeedbackServletUtil.getUserFeedback(userId));
	});

	/**
	 * 
	 */
	router.post("/", async (request, result) => {
		if (isBadRequest(request)) {
			result.status(400);
		}
		try {
			result.json(await FeedbackServletUtil.postUserFeedback(request.body));
		} catch ( error ) {
			result.status(500).json(error);
		}
	});
}
