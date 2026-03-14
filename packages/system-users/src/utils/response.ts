import { Context } from 'hono';
import { USER_SYSTEM } from '../config/constants';

const { HTTP_CODE, STATUS } = USER_SYSTEM;

export const success = (c: Context, data: any = null, message: string = 'Success') => {
    return c.json({
        status: STATUS.SUCCESS,
        message,
        data,
        timestamp: new Date().toISOString()
    }, HTTP_CODE.OK);
};

export const error = (c: Context, message: string = 'Error', code: number = HTTP_CODE.BAD_REQUEST) => {
    return c.json({
        status: STATUS.ERROR,
        message,
        timestamp: new Date().toISOString()
    }, code as any);
};

export const notFound = (c: Context, message: string = 'Not Found') => {
    return error(c, message, HTTP_CODE.NOT_FOUND);
};

export const badRequest = (c: Context, message: string = 'Bad Request') => {
    return error(c, message, HTTP_CODE.BAD_REQUEST);
};

export const serverError = (c: Context, message: string = 'Internal Server Error') => {
    return error(c, message, HTTP_CODE.INTERNAL_ERROR);
};

export const paginated = (c: Context, data: any[], meta: any) => {
    return c.json({
        status: STATUS.SUCCESS,
        data,
        meta,
        timestamp: new Date().toISOString()
    }, HTTP_CODE.OK);
};
