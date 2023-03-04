import express from "express";
import _ from "lodash";
import { FlagServletUtils } from "./FlagServletUtils";
import { isBadRequest } from "./utils/isBadRequest";

export namespace FlagServlet {
	/**
	 * 
	 */
	export const PATH = "/flag";
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
		result.json(await FlagServletUtils.getFlags(userId));
	});

	/**
	 * 
	 */
	router.post("/", async (request, result) => {
		if (isBadRequest(request)) {
			result.status(400);
		}
		try {
			result.json(await FlagServletUtils.flagProduct(request.body));
		} catch ( error ) {
			result.status(500).json(error);
		}
	});
}
