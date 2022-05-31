import { Request, Response } from "express";
import * as config from "../config";

export const get = (req: Request, res: Response) => {
  res.render(config.SECURE_REGISTER_FILTER_PAGE, {
    backLinkUrl: config.LANDING_URL
  });
};

export const post = (req: Request, res: Response) => {
  if (req.body.secureRegister === "yes") {
    return res.render(config.USE_PAPER_PAGE, {
      backLinkUrl: config.SECURE_REGISTER_FILTER_URL
    });
  } else {
    res.redirect(config.INTERRUPT_CARD_URL);
  }
};
