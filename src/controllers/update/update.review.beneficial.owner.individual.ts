import { UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL, UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE } from "../../config";
import { Request, Response } from "express"
import { BeneficialOwnerIndividual } from "../../model/beneficial.owner.individual.model";
import { getApplicationData } from "../../utils/application.data";
import { logger } from "../../utils/logger";

let boAppData: BeneficialOwnerIndividual[] | undefined;
let indexTracker: number = 0;


export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);
  const appData = getApplicationData(req.session);
  boAppData = appData.update?.review_beneficial_owners_individual 

  return res.render(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE, {
    backLinkUrl: UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL,
    templateName: UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
    boAppData,
    indexTracker
  });
}

export const post = (req: Request, res: Response) => {
  
}




// export const postcheckAndReviewBo = async (req: Request, res: Response, next: NextFunction) => {
//     //add save and resume before returning to another review bo page

// const session = req.session as Session;
// console.log(`req body is ${JSON.stringify(req.body)}`)

// // save the reviewed to the main app model
// const data: ApplicationDataType = setBeneficialOwnerData(req.body, uuidv4());
// setApplicationData(session, data, BeneficialOwnerIndividualKey);

// // await saveAndContinue(req, session, false);


// const appData = getApplicationData(req.session);
// const boIndex: number = req.body["boIndex"];
// console.log(`bo index req body ${boIndex}`) 

// const nextBoToReview = appData.update?.review_beneficial_owners_individual;
// let listSize = nextBoToReview?.length || 0;
// console.log(`size of the list is ${listSize}`)
//   if (boIndex+1 === listSize || listSize === 0) {
//     console.log(`calling if redirection`)
//     res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_PAGE);
//   } else if((boIndex) < listSize && boAppData) {
//     console.log(`Calling else post check bo, tracker is ${boIndex}`)
//     while(boIndex < listSize){
//       boAppData[boIndex+1];
//       indexTracker++;
//       res.redirect(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE);
//     }
//   } 
// return next();
// }


// export const checkAvailableBo = (req: Request, res: Response, next: NextFunction) => {
// const appData = getApplicationData(req.session);
// if(appData.update?.review_beneficial_owners_individual?.length) {
//   getReviewBo(req, res);
// } else {
//   get(req, res);
// }
// }

// export const checkIfReviewedBoSubmission = (req: Request, res: Response, next: NextFunction) => {
// if(req.body["boIndex"]) {
//   postcheckAndReviewBo(req, res, next);
// }else {
//   post(req, res, next);
// }
// }