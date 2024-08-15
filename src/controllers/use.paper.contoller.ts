import * as config from "../config";
import { Request, Response } from "express";

export const get = (req: Request, res: Response) => {
  const applyWithPaperFormHeading: string = "You'll need to apply using the paper form";
  return res.render(config.USE_PAPER_PAGE, {
    backLinkUrl: config.SECURE_REGISTER_FILTER_URL,
    templateName: config.USE_PAPER_PAGE,
    applyWithPaperFormHeading,
    pageParams: {
      isRegistration: true
    }
  });
};
