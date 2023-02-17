import _ from "lodash";

export function packIntoArray(value: any) {
    if (_.isArray(value)) {
        return value;
    } else if ( _.isUndefined(value) || _.isNull(value) ) {
        return [];
    } else {
        return [value];
    }
}