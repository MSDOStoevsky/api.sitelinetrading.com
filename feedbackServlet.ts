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
	router.post("/:id", async (request, result) => {
		if (isBadRequest(request)) {
			result.status(400);
		}
		const feedbackId = request.params.id;
			const dbOp = await FeedbackServletUtil.postUserFeedback(feedbackId, request.body);
			
			if ( dbOp && (dbOp as any).status === "failure") {

				result.status(500).json(dbOp);
			} else {

				result.json(dbOp);
			}
	});


	/**
	 * 
	 */
	router.post("/", async (request, result) => {
		if (isBadRequest(request)) {
			result.status(400);
		}
		result.json(await FeedbackServletUtil.startUserFeedback(request.body));
	});
}
