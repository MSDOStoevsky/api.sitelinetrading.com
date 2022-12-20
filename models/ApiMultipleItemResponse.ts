import { ObjectMap } from "../utils/types";
/**
 * The api response for calls which have multiple data items.
 */
export interface ApiMultipleItemResponse {
    /**
     * The list of data items from the api.
     */
    data: ReadonlyArray<ObjectMap<any>>;
}