import express from "express";
import _ from "lodash";
import { ProductServletUtils } from "./ProductServletUtils";
import { isBadRequest } from "./utils/isBadRequest";
import * as jwt from "jsonwebtoken";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Product } from "./models/Product";
const upload = multer({ dest: 'uploads/' });

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
		const getProductResponse = await ProductServletUtils.getProduct(productId);
		if ( getProductResponse ) {
			result.json(getProductResponse);
		} else {
			result.json({
				data: null
			})
		}
	});

	/**
	 * 
	 */
	router.patch("/:id", upload.single('file'), async (request, result) => {
		const productId = request.params.id;
		if (isBadRequest(request)) {
			result.status(400);
		}
		const uploadedImage = request.file;
		const token = _.split(request.headers.authorization, " ")[1];
		jwt.verify(token, process.env.BCRYPT_SECRET as string, async (error, decoded) => {
			if ( error !== null || !decoded || typeof decoded === "string") {
				result.status(400).json({ error: "Expired Token Error" });
			} else {
				try {
					const userId = decoded.id;
					let productData = JSON.parse(request.body.data) as Product;

					if (userId !== productData.userId) {
						result.status(500).json({status: "failure", message: "you do not have permission"});
					} else {

						if ( uploadedImage ) {
							const uploadedImageResult = await cloudinary.uploader.upload(uploadedImage?.path!, { public_id: uploadedImage?.filename });
							productData = { ...productData, image: uploadedImageResult.secure_url };
						}
						const updateProductResult = await ProductServletUtils.updateProduct(productId, productData);
						result.json(updateProductResult);
					}
				} catch(error) {
					result.status(500)
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
		jwt.verify(token, process.env.BCRYPT_SECRET as string, async (error, decoded) => {
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
	router.post("/", upload.single('file'), async (request, result) => {
		if (isBadRequest(request)) {
			result.status(400);
		}
		const uploadedImage = request.file;
		const token = _.split(request.headers.authorization, " ")[1];
		jwt.verify(token, process.env.BCRYPT_SECRET as string, async (error, decoded) => {
			if ( error !== null || !decoded || typeof decoded === "string") {
				result.status(400).json({ error: "Expired Token Error" });
			} else {
				let productData = JSON.parse(request.body.data) as Product;

				if ( uploadedImage ) {
					const uploadedImageResult = await cloudinary.uploader.upload(uploadedImage?.path!, { public_id: uploadedImage?.filename });
					productData = { ...productData, image: uploadedImageResult.secure_url};
				}
				const userId = decoded.id;

				if (userId !== productData.userId) {
					result.status(500).json({status: "failure", message: "you do not have permission"});
				} else {
					result.json(await ProductServletUtils.addProduct(productData));
				}
			}
		});
	});
}
