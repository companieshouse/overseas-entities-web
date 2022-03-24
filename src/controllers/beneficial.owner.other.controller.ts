import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { logger } from "../utils/logger";


export const get = (req: Request, res: Response) => {
  logger.debug(`GET BENEFICIAL_OWNER_OTHER_PAGE`);
  res.render(config.BENEFICIAL_OWNER_OTHER_PAGE, {
    backLinkUrl: config.BENEFICIAL_OWNER_TYPE_PAGE
  });
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {

    // buildCorproateBeneficialOwner(req);
    // const session: Session = req.session as Session;

    return res.redirect(config.LANDING_URL);
  } catch (e) {
    return next(e);
  }
};
/*
const buildCorproateBeneficialOwner = (req: Request) => {
   const name = req.body.corpName;
   const addressLine1 = req.body.addressLine1;
   const addressLine2 = req.body.addressLine2;
   const addressTown = req.body.addressTown;
   const addressCountry = req.body.addressCountry;
   const addressPostcode = req.body.addressPostcode;

   if(req.body.sameAddress)
   {
       const serviceAddressLine1 = req.body.serviceAddressLine1;
       const serviceAddressLine2 = req.body.serviceAddressLine2;
       const serviceAddressTown = req.body.serviceAddressTown;
       const serviceAddressCountry = req.body.serviceAddressCountry;
       const serviceAddressPostcode = req.body.serviceAddressPostcode;
   }
   const corpLawGoverned = req.body.corpLawGoverned;
   const corpNatureOfControl = req.body.corpNatureOfControl;
   const corpStartdate = req.body.corpStartdate;
   const statementCondition = req.body.statementCondition;
   const ownerSanctions = req.body.ownerSanctions;
};*/
