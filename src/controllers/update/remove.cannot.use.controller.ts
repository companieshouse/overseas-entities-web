import { Request, Response } from "express";
import * as config from "../../config";

export const get = (req: Request, res: Response) => {
  return res.render(config.REMOVE_CANNOT_USE_PAGE, {
    journey: config.JourneyType.remove,
    backLinkUrl: `${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
    templateName: config.CANNOT_USE_PAGE
  });
};
