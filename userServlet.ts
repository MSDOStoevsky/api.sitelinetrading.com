import express from "express";
import _ from "lodash";
import { UserServletUtils } from "./UserServletUtils";

export namespace UserServlet {
	/**
	 * The servlet base path.
	 */
	export const PATH = "/user";
	/**
	 * The router associated with this servlet.
	 */
	export const router = express.Router();

	/**
	 * The single product get endpoint.
	 */
	router.get("/:id", async (request, result) => {
		const userId = request.params.id;
		result.json(await UserServletUtils.getUser(userId));
	});

	/**
	 * The single product get endpoint.
	 */
	router.get("/me", async (request, result) => {
		result.json(await UserServletUtils.getMe());
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
	router.post("/create", async ( request, result) => {
		try {
			const createResult = await UserServletUtils.create(request.body);
            result.json(createResult);
		} catch(error) {
			result.status(500).json(error);
		}
	});
}
