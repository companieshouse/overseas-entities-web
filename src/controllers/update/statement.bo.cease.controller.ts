import { NextFunction, Request, Response } from "express";
import { UPDATE_STATEMENT_BO_CEASE_PAGE, UPDATE_STATEMENT_BO_CEASE_URL } from "../../config";
import { getStatmentBOCease } from "../../utils/update/statement.bo.cease";

export const get = (req: Request, res: Response, next: NextFunction) => {
  return getStatmentBOCease(req, res, next, UPDATE_STATEMENT_BO_CEASE_PAGE, UPDATE_STATEMENT_BO_CEASE_URL);
};
