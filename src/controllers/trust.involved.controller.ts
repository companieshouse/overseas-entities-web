import { NextFunction, Request, Response } from 'express';
import * as config from '../config';
import { logger } from '../utils/logger';
// import { getApplicationData, setExtraData } from '../utils/application.data';
import { getApplicationData } from '../utils/application.data';
import * as mapperToPageService from '../utils/trust/mapper.to.page';
// import * as mapperToSessionService from '../utils/trust/mapper.to.session';
import { ApplicationData } from '../model/application.model';
import * as PageModel from '../model/trust.page.model';
import { Trust, TrustKey } from '../model/trust.model';
import { body } from 'express-validator';

const TRUST_INVOLVED_TEXTS = {
  title: 'Individuals or entities involved in the trust',
};

const get = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);

    const trustId = req.params['id'];
    const pageData: PageModel.TrustWhoIsInvolved = mapperToPageService.mapTrustWhoIsInvolvedToPage(
      appData[TrustKey]?.find(trust => trust.trust_id === trustId),
    );


    const templateName = config.TRUST_INVOLVED_PAGE;

    return res.render(
      templateName,
      {
        backLinkUrl: config.BENEFICIAL_OWNER_TYPE_PAGE,
        templateName,
        pageParams: {
          title: TRUST_INVOLVED_TEXTS.title,
        },
        pageData,
      },
    );
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const post = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const trustId = req.params['id'];

    // TODO if id is not present then show 404 page

    //  get trust data from session to check that user has not altered the url
    const appData: ApplicationData = getApplicationData(req.session);
    const trusts: Trust[] = appData[TrustKey] ?? [];
    const trustIndex = trusts.findIndex(trust => trust.trust_id === trustId);
    if (! trustIndex) {
      logger.debugRequest(req, "TODO - redirect to 404");
    }

    const typeOfTrustee = req.body.typeOfTrustee;

    logger.debugRequest(req, "typeOfTrustee " + typeOfTrustee);
    logger.debug(req.body);

    //  map form data to session trust data
    // const details = mapperToSessionService.mapDetailToSession(req.body);

    //  add new details to session trusts array
    // if (!details.trust_id) {
    //   details.trust_id = String(trusts.length + 1);
    // }

    // trusts.push(details);

    // //  save to session
    // setExtraData(
    //   req.session,
    //   {
    //     ...appData,
    //     [TrustKey]: trusts,
    //   },
    // );

    // TODO:
    // if type field not defined then re-display page with error message ?
  

    return res.redirect(config.CHECK_YOUR_ANSWERS_URL);
  } catch (error) {
    logger.errorRequest(req, error);

    return next(error);
  }
};

export {
  get,
  post,
  TRUST_INVOLVED_TEXTS,
};
