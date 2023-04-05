import { NextFunction, Request, Response } from "express";

import {
  getBeneficialOwnerIndividual,
  getBeneficialOwnerIndividualById,
  postBeneficialOwnerIndividual,
  removeBeneficialOwnerIndividual,
  updateBeneficialOwnerIndividual
} from "../../utils/beneficial.owner.individual";

import { UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL } from "../../config";
import { getApplicationData } from "../../utils/application.data";
import { BeneficialOwnerIndividual } from "../../model/beneficial.owner.individual.model";
import { logger } from "../../utils/logger";

let boAppData: BeneficialOwnerIndividual[] | undefined;

export const get = (req: Request, res: Response) => {
  getBeneficialOwnerIndividual(req, res, UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  getBeneficialOwnerIndividualById(req, res, next, UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, UPDATE_BENEFICIAL_OWNER_TYPE_URL);
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  postBeneficialOwnerIndividual(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  updateBeneficialOwnerIndividual(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  removeBeneficialOwnerIndividual(req, res, next, UPDATE_BENEFICIAL_OWNER_TYPE_URL, false);
};

export const getReviewBo = (req: Request, res: Response) => {
    //set a variable to check if redirection, then increase the index to the ui 
    // if(req.statusCode === 301){
    //   let logIndex: number = +1;
    // }
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData = getApplicationData(req.session);
      console.log(`bo data parsed is ${JSON.stringify(appData.update?.review_beneficial_owners_individual)}`)
      boAppData = appData.update?.review_beneficial_owners_individual 
    
    console.log(`bo apps data on the long ${JSON.stringify(appData.update?.review_beneficial_owners_individual)}`)
    return res.render(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, {
      backLinkUrl: UPDATE_BENEFICIAL_OWNER_TYPE_URL,
      templateName: UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
      boAppData,
      // logIndex
    });
  }


export const postcheckAndReviewBo = (req: Request, res: Response, next: NextFunction) => {
      //add save and resume before returning to another review bo page

  const appData = getApplicationData(req.session);
  const boIndex = req.body["boIndex"];
  const nextBoToReview = appData.update?.review_beneficial_owners_individual;
  let listSize = nextBoToReview?.length || 0;
    if (boIndex === listSize) {
      res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_PAGE);
    } else if(boIndex < listSize) {
      boAppData?.indexOf(boIndex+1);
      res.redirect(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE);
    } 

  return next();
}

export const checkAvailableBo = (req: Request, res: Response, next: NextFunction) => {
  const appData = getApplicationData(req.session);
  if(appData.update?.review_beneficial_owners_individual?.length) {
    getReviewBo(req, res);
  } else {
    get(req, res);
  }
}

export const checkIfReviewedBoSubmission = (req: Request, res: Response, next: NextFunction) => {
  if(req.body["boIndex"]) {
    postcheckAndReviewBo(req, res, next);
  }else {
    post(req, res, next);
  }
}