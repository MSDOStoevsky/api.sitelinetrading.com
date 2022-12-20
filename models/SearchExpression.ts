
/**
 * The order expression.
 */
export interface OrderExpression {
	field: string;
	order: "ASC" | "DESC";
}

/**
 * The product search expression.
 */
export interface SearchExpression {
	filterExpression?: Record<string, string>;
	select: string[] | "*";
	orderBy: OrderExpression;
	page: number;
	pageSize: number;
}
