import { Request, Response } from "express";
import * as config from "../../config";

export const get = (req: Request, res: Response) => {
    return res.render(config.REMOVE_CANNOT_USE_PAGE, {
        backLinkUrl: config.SOLD_LAND_FILTER_URL,
        templateName: config.CANNOT_USE_PAGE
    });
}; 