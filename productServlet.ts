import express from "express";
import _ from "lodash";
import { ProductServletUtils } from "./ProductServletUtils";

export namespace ProductServlet {
	/**
	 * The servlet base path.
	 */
	export const PATH = "/product";
	
	/**
	 * The router associated with this servlet.
	 */
	export const router = express.Router();

	/**
	 * The global product search endpoint
	 */
	router.post("/search", async (request, result) => {
		result.json(await ProductServletUtils.search(request.body));
	});

	/**
	 * The single product get endpoint.
	 */
	router.get("/:id", async (request, result) => {
		const productId = request.params.id;
		result.json(await ProductServletUtils.getProduct(productId));
	});


	/**
	 * The global product search endpoint
	 */
	 router.post("/", async (request, result) => {
		result.json(await ProductServletUtils.addProduct(request.body));
	});
}
