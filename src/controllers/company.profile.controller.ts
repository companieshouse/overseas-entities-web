import { Session } from "@companieshouse/node-session-handler";
import { Request, Response } from "express";
import { ApplicationData } from "model";
import * as config from "../config";
import { getOverseasEntity } from "../service/overseas.entities.service";
import { getApplicationData } from "../utils/application.data";

export const get = async (req: Request, res: Response) => {
  const session = req.session as Session;
  const appData: ApplicationData = getApplicationData(session);
  const overseasResponse = await getOverseasEntity(req, session);
  console.log(`ROE COMPANY PROFILE CHECK: OLAY ${overseasResponse}`);
  //   let backLinkUrl: string = config.BENEFICIAL_OWNER_TYPE_URL;
  //   let updateUrl: string = config.UPDATE_COMPANY_PROFILES_URL;

  return res.render(config.UPDATE_COMPANY_PROFILE, {
    // backLinkUrl,
    // updateUrl,
    templateName: config.UPDATE_COMPANY_PROFILE_PAGE,
    appData
  });
};

