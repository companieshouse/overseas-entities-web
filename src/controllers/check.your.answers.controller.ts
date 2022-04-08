import { Request, Response } from "express";
import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData } from "../model";
import { getApplicationData } from "../utils/application.data";
import { presenterRole } from "../model/presenter.model";

export const get = (req: Request, res: Response) => {
  logger.debug(`GET ${config.CHECK_YOUR_ANSWERS_PAGE}`);

  const appData: ApplicationData = getApplicationData(req.session);
  return res.render(config.CHECK_YOUR_ANSWERS_PAGE, {
    backLinkUrl: config.MANAGING_OFFICER_CORPORATE_URL,
    appData,
    presenterRole: getPresenterRoleDisplayText(appData)
  });
};

const getPresenterRoleDisplayText = (appData: ApplicationData): string | undefined => {
  const roleEnum: presenterRole | undefined = appData.presenter?.role;
  if (roleEnum === undefined) {
    return "";
  }
  const roleMap = {
    [presenterRole.administrator]: "Administrator",
    [presenterRole.agent]: "Agent",
    [presenterRole.solicitor]: "Solicitor",
    [presenterRole.beneficialOwner]: "Beneficial owner",
    [presenterRole.other]: appData.presenter?.roleTitle
  };

  return roleMap[roleEnum];
};
