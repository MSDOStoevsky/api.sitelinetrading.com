import { ApiMultipleItemResponse } from "./ApiMultipleItemResponse";
/**
 * The pagination info.
 */
interface PageInfo {
	/**
	 * The total number of items in the search.
	 */
	totalItems: number;
	/**
	 * The current page being requested.
	 */
	currentPage: number;
	/**
	 * The total number of pages available.
	 */
	totalPages: number;
}

/**
 *
 */
export interface ApiPaginatedSearchResponse extends ApiMultipleItemResponse {
	/**
	 * The current {@link PageInfo}
	 */
	pageInfo: PageInfo;
}
