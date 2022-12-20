import { ObjectMap } from '../utils/types';

/**
 * The api response for calls which have one data item.
 */
export interface ApiSingleItemResponse {
    /**
     * The data item from the api.
     */
    data: ObjectMap<any>;
}