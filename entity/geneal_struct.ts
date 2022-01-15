import { getSession } from "next-auth/react";

interface IRequestError {error: string}
export interface RequestError extends IRequestError {code: number}


