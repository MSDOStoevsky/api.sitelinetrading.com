import _ from "lodash";
import { SearchExpression } from "./models/SearchExpression";
import { Product } from "./models/Product";
import * as dotenv from 'dotenv';
import { SQLite } from "./Sqlite";
import { v4 as uuidv4 } from 'uuid';
import { packIntoArray } from "./utils/packIntoArray";
dotenv.config();

const cloudinary = require('cloudinary').v2;

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET
});

export namespace ProductServletUtils {

	export async function search(searchRequest: SearchExpression) {
		
		const translateFilterExpression = (filterExpression: any) => {
			return _(filterExpression).pickBy((filterValue) => {
				return !!filterValue;
			}).map((filterValue, key) => {
					if ( key === "userId") {
						return `${key} = '${filterValue}'`
					}

					if ( typeof filterValue === "boolean" ) {
						return `${key} = ${filterValue ? 1 : 0}`;
					}

					if ( typeof filterValue === "string" ) {
						return `${key} LIKE '%${filterValue}%'`;
					} 

					return `${key} LIKE '%${filterValue}%'`;
				}).value();
		};

		try {
			const pageEnd = (searchRequest.page + 1) * searchRequest.pageSize;
			const pageStart = pageEnd - searchRequest.pageSize;
			const field = searchRequest.orderBy.field === "createdTimestamp" ? "product.createdTimestamp" : searchRequest.orderBy.field;
			const orderString = searchRequest.orderBy ? `${field} ${searchRequest.orderBy.order}` : "product.createdTimestamp DESC";
			const filterExpression = translateFilterExpression(searchRequest.filterExpression);
			const search = SQLite.prepare(`SELECT id, userId, displayName, title, description, value, openToTrade, createdTimestamp, image, state
			FROM    ( SELECT    ROW_NUMBER() OVER ( ORDER BY ${orderString} ) AS RowNum, 
								product.id as id,
								userId,
								displayName,
								title,
								description,
								value,
								openToTrade,
								product.createdTimestamp,
								image,
								state
					  FROM      product
					  LEFT JOIN user ON user.id = userId
					  ${_.isEmpty(filterExpression) ? "":`WHERE ${filterExpression.join(" AND ")}`}
					) AS RowConstrainedResult
			WHERE   RowNum >= ${pageStart}
				AND RowNum < ${pageEnd}
			ORDER BY RowNum`).all();
			const totalItems = SQLite.prepare(`SELECT COUNT(*) as numberOfItems from product`).get().numberOfItems;
			return {
				data: packIntoArray(search),
				pageInfo: {
					totalItems,
					currentPage: searchRequest.page,
					totalPages: _.ceil(totalItems / searchRequest.pageSize)
				}
			}
		} catch ( error ) {
			throw error;
		}
	}

	export function getProduct(productId: string): { data?: Product, error?: any } {
		try {
			const stmt = SQLite.prepare(`
				SELECT product.id, userId, title, description, value, user.displayName, openToTrade, product.createdTimestamp, product.updatedTimestamp, image, state 
				FROM product 
				LEFT JOIN user ON user.id = product.userId 
				WHERE product.id = ?;
			`);
			return {
				data: stmt.get(productId) || null
			}
		} catch ( error ) {
			console.log(error)
			throw error;
		}
	}


	export function addProduct(productForPost: Product): any {
		const insertedId = uuidv4();
		const now = Date.now();
		const stmt = SQLite.prepare('INSERT INTO product (id, userId, title, state, image, description, value, openToTrade, createdTimestamp, updatedTimestamp) VALUES (?,?,?,?,?,?,?,?,?,?)');
		try {
			stmt.run(insertedId, productForPost.userId, productForPost.title, productForPost.state, productForPost.image, productForPost.description, productForPost.value, productForPost.openToTrade ? 1 : 0, now, now);
			return {
				data: { insertedId }
			}
		} catch ( error ) {
			throw error;
		}
	}

	export async function updateProduct(productId: string, productForUpdate: Partial<Product>): Promise<any> {
		const insertedId = uuidv4();
		const stmt = SQLite.prepare('UPDATE product SET id = ?, userId = ?, title = ?, image = ?, description = ?, value = ?, openToTrade = ?, updatedTimestamp = ?');
		try {
			stmt.run(insertedId, productForUpdate.title, productForUpdate.image, productForUpdate.description, productForUpdate.value, String(productForUpdate.openToTrade), Date.now());
			return {
				data: { updatedId: productId }
			}
		} catch ( error ) {
			throw error;
		}
	}

	export async function deleteProduct(productId: string): Promise<any> {
		SQLite.prepare('DELETE FROM product WHERE id = ?').run(productId);
		try {
			return {
				data: { deletedId: productId }
			}
		} catch ( error ) {
			throw error;
		}
	}
}
