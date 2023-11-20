import { Request, Response } from "express";
import { logger } from "../../utils/logger";

export const get = (req: Request, res: Response) => {
    logger.debugRequest(req, `GET ...`);
    return res.render("", {});
}; 