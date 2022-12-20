/**
 * Helper type that defines a mapping of a string key to some object T
 */
export type ObjectMap<T> = {
    [name: string]: T;
};
