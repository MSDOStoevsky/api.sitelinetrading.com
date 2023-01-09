import express from "express";
import _ from "lodash";
import { ProductServletUtils } from "./ProductServletUtils";
import { isBadRequest } from "./utils/isBadRequest";
import * as jwt from "jsonwebtoken";

export namespace ProductServlet {
	/**
	 * The servlet base path.
	 */
	export const PATH = "/product";
	
	/**
	 * 
	 */
	export const router = express.Router();

	/**
	 * 
	 */
	router.post("/search", async (request, result) => {
		result.json(await ProductServletUtils.search(request.body));
	});

	/**
	 * 
	 */
	router.get("/:id", async (request, result) => {
		const productId = request.params.id;
		result.json(await ProductServletUtils.getProduct(productId));
	});

	/**
	 * 
	 */
	router.patch("/:id", async (request, result) => {
		const productId = request.params.id;
		if (isBadRequest(request)) {
			result.status(400);
		}
		const token = _.split(request.headers.authorization, " ")[1];
		jwt.verify(token, "shhhhh", async (error, decoded) => {
			if ( error !== null || !decoded || typeof decoded === "string") {
				result.status(400).json({ error: "Expired Token Error" });
			} else {
				const userId = decoded.id;
				const productForUpdate = request.body;
				if (userId !== productForUpdate.userId) {
					result.status(500).json({status: "failure", message: "you do not have permission"});
				} else {
					const updateProductResult = await ProductServletUtils.updateProduct(productId, productForUpdate);
					result.json(updateProductResult);
				}
			}
		});
	});

	/**
	 * 
	 */
	router.delete("/:id", async (request, result) => {
		const productId = request.params.id;
		if (isBadRequest(request)) {
			result.status(400);
		}
		const token = _.split(request.headers.authorization, " ")[1];
		jwt.verify(token, "shhhhh", async (error, decoded) => {
			if ( error !== null || !decoded || typeof decoded === "string") {
				result.status(400).json({ error: "Expired Token Error" });
			} else {
				const userId = decoded.id;

				const getProductResult = await ProductServletUtils.getProduct(productId);

				if (getProductResult.data && (userId !== getProductResult.data?.userId)) {
					result.status(500).json({status: "failure", message: "you do not have permission"});
				} else {
					const updateProductResult = await ProductServletUtils.deleteProduct(productId);
					result.json(updateProductResult);
				}
			}
		});
	});


	/**
	 * 
	 */
	router.post("/", async (request, result) => {
		result.json(await ProductServletUtils.addProduct(request.body));
	});
}
