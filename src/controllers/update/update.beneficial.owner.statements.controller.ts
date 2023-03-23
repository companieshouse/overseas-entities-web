// Import necessary types and components from external packages
import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

// Import project-specific configurations, utility functions, and types
import * as config from "../../config";
import { logger } from "../../utils/logger";
import { ApplicationData } from "../../model";
import { checkBOsDetailsEntered, checkMOsDetailsEntered, getApplicationData, setExtraData } from "../../utils/application.data";
import { BeneficialOwnersStatementType, BeneficialOwnerStatementKey } from "../../model/beneficial.owner.statement.model";
import { saveAndContinue } from "../../utils/save.and.continue";

// Define the GET request handler for the beneficial owner statements page
export const get = (req: Request, res: Response, next: NextFunction) => {
  try {

    console.log("---->>>>> getBeneficialOwnerStatementsController.get()");

    // Log the incoming GET request
    logger.debugRequest(req, `GET ${config.BENEFICIAL_OWNER_STATEMENTS_PAGE}`);

    // Retrieve the application data from the session
    const appData: ApplicationData = getApplicationData(req.session);

    // Render the beneficial owner statements page with the necessary data
    return res.render(config.BENEFICIAL_OWNER_STATEMENTS_PAGE, {
      backLinkUrl: config.ENTITY_URL,
      templateName: config.BENEFICIAL_OWNER_STATEMENTS_PAGE,
      [BeneficialOwnerStatementKey]: appData[BeneficialOwnerStatementKey]
    });
  } catch (error) {
    // Log the error and pass it to the error handling middleware
    logger.errorRequest(req, error);
    next(error);
  }
};

// Define the POST request handler for the beneficial owner statements page
export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Log the incoming POST request
    logger.debugRequest(req, `POST ${config.BENEFICIAL_OWNER_STATEMENTS_PAGE}`);

    // Retrieve the session and the beneficial owner statement from the request body
    const session = req.session as Session;
    const boStatement = req.body[BeneficialOwnerStatementKey];

    // Retrieve the application data from the session
    const appData: ApplicationData = getApplicationData(session);

    // Check if a beneficial owner statement already exists in the application data and
    // if the new statement would delete or modify existing data
    if (
      appData[BeneficialOwnerStatementKey] &&
      (
        ( boStatement === BeneficialOwnersStatementType.NONE_IDENTIFIED && checkBOsDetailsEntered(appData) ) ||
        ( boStatement === BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS && checkMOsDetailsEntered(appData) )
      )
    ){
      // Redirect the user to the warning page with a query parameter indicating the new statement type
      return res.redirect(`${config.BENEFICIAL_OWNER_DELETE_WARNING_URL}?${BeneficialOwnerStatementKey}=${boStatement}`);
    }

    // Update the application data with the new beneficial owner statement
    appData[BeneficialOwnerStatementKey] = boStatement;

    // Save the updated application data to the session
    setExtraData(session, appData);

    // Save the application progress and handle any necessary side effects
    await saveAndContinue(req, session);

    // Redirect the user to the beneficial owner type selection page
    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    // Log the error and pass it to the error handling middleware
    logger.errorRequest(req, error);
    next(error);
  }
};
