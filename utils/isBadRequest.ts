import { Request } from "express";

export function isBadRequest(request: Request): boolean {
    return !request.headers.authorization
}