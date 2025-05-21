import { Request, Response, NextFunction } from 'express';
import { getDataForReview } from '../../src/utils/check.your.answers';
import { fetchApplicationData } from '../../src/utils/application.data';
import { isRegistrationJourney, isRemoveJourney } from '../../src/utils/url';
import { checkEntityReviewRequiresTrusts } from '../../src/utils/trusts';
import { checkRPStatementsExist } from '../../src/utils/relevant.period';
import { Session } from "@companieshouse/node-session-handler";
import { relevantPeriodStatementsState } from '../../src/controllers/update/confirm.overseas.entity.details.controller';

jest.mock('../../src/utils/application.data', () => ({ fetchApplicationData: jest.fn() }));
jest.mock('../../src/utils/logger');
jest.mock('../../src/utils/relevant.period', () => ({ checkRPStatementsExist: jest.fn() }));
jest.mock('../../src/utils/trusts', () => ({
  ...jest.requireActual('../../src/utils/trusts'),
  checkEntityReviewRequiresTrusts: jest.fn()
}));
jest.mock('../../src/utils/check.your.answers', () => ({
  ...jest.requireActual('../../src/utils/check.your.answers'),
  getBackLinkUrl: jest.fn(),
  getTemplateName: jest.fn()
}));
jest.mock('../../src/utils/url', () => ({
  ...jest.requireActual('../../src/utils/url'),
  isRemoveJourney: jest.fn(),
  isRegistrationJourney: jest.fn()
}));

describe('getDataForReview calls render for check your answers page', () => {

  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { session: {} as Session, method: 'GET', route: { path: '/review' } };
    res = { render: jest.fn() };
    next = jest.fn();
    (isRemoveJourney as jest.Mock).mockReset();
    (isRegistrationJourney as jest.Mock).mockReset();
    (fetchApplicationData as jest.Mock).mockReset();
    (checkEntityReviewRequiresTrusts as jest.Mock).mockReset();
    (checkRPStatementsExist as jest.Mock).mockReset();
  });

  it('during update if relevant period statement exists and no_change is false', async () => {
    (isRemoveJourney as jest.Mock).mockResolvedValue(false);
    (isRegistrationJourney as jest.Mock).mockResolvedValue(false);
    (checkRPStatementsExist as jest.Mock).mockReturnValue(true);
    const mockAppData = { update: { no_change: false } };
    (fetchApplicationData as jest.Mock).mockResolvedValue(mockAppData);
    await getDataForReview(req as Request, res as Response, next as NextFunction, false);
    expect(getDataForReview).toBeDefined();
    expect(res.render).toHaveBeenCalledWith('update-check-your-answers', expect.objectContaining(
      { "FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC": false,
        "backLinkUrl": "/update-an-overseas-entity/update-registrable-beneficial-owner",
        "changeLinkUrl": "/update-an-overseas-entity/entity",
        "overseasEntityHeading": "Overseas entity details",
        "pageParams": { "hasAnyBosWithTrusteeNocs": false,
          "isRPStatementExists": true,
          "isRegistration": false,
          "isTrustFeatureEnabled": false,
          "noChangeFlag": false,
          "no_change": false,
          "relevantPeriodStatements": false },
        "roleTypes": { "BENEFICIARY": "Beneficiary",
          "GRANTOR": "Grantor",
          "HISTORICAL_BENEFICIAL_OWNER": "Historical_Beneficial_Owner",
          "INTERESTED_PERSON": "Interested_Person",
          "SETTLOR": "Settlor" },
        "templateName": "update-check-your-answers",
        "whoIsCompletingChangeLink": "/update-an-overseas-entity/who-is-making-update"
      }
    ));
  });

  it('during update if relevant period statement exists and no_change is true', async () => {
    (isRemoveJourney as jest.Mock).mockResolvedValue(false);
    (checkRPStatementsExist as jest.Mock).mockReturnValue(true);
    const mockAppData = { update: { no_change: true } };
    (fetchApplicationData as jest.Mock).mockResolvedValue(mockAppData);
    await getDataForReview(req as Request, res as Response, next as NextFunction, false);
    expect(getDataForReview).toBeDefined();
    expect(res.render).toHaveBeenCalledWith('update-check-your-answers', expect.objectContaining(
      { "FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC": false,
        "backLinkUrl": "/update-an-overseas-entity/update-registrable-beneficial-owner",
        "changeLinkUrl": "/update-an-overseas-entity/entity",
        "overseasEntityHeading": "Overseas entity details",
        "pageParams": { "hasAnyBosWithTrusteeNocs": false,
          "isRPStatementExists": true,
          "isRegistration": false,
          "isTrustFeatureEnabled": false,
          "noChangeFlag": false,
          "no_change": true,
          "relevantPeriodStatements": false },
        "roleTypes": { "BENEFICIARY": "Beneficiary",
          "GRANTOR": "Grantor",
          "HISTORICAL_BENEFICIAL_OWNER": "Historical_Beneficial_Owner",
          "INTERESTED_PERSON": "Interested_Person",
          "SETTLOR": "Settlor" },
        "templateName": "update-check-your-answers",
        "whoIsCompletingChangeLink": "/update-an-overseas-entity/who-is-making-update"
      }
    ));
  });

  it('during update if relevant period statement exists and no_change empty', async () => {
    (isRemoveJourney as jest.Mock).mockResolvedValue(false);
    (checkRPStatementsExist as jest.Mock).mockReturnValue(true);
    (checkEntityReviewRequiresTrusts as jest.Mock).mockReturnValue(false);
    const mockAppData = { update: { no_change: '' } };
    (fetchApplicationData as jest.Mock).mockResolvedValue(mockAppData);
    await getDataForReview(req as Request, res as Response, next as NextFunction, false);
    expect(getDataForReview).toBeDefined();
    expect(res.render).toHaveBeenCalledWith('update-check-your-answers', expect.objectContaining(
      { "FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC": false,
        "backLinkUrl": "/update-an-overseas-entity/update-registrable-beneficial-owner",
        "changeLinkUrl": "/update-an-overseas-entity/entity",
        "overseasEntityHeading": "Overseas entity details",
        "pageParams": { "hasAnyBosWithTrusteeNocs": false,
          "isRPStatementExists": true,
          "isRegistration": false,
          "isTrustFeatureEnabled": false,
          "noChangeFlag": false,
          "no_change": '',
          "relevantPeriodStatements": false },
        "roleTypes": { "BENEFICIARY": "Beneficiary",
          "GRANTOR": "Grantor",
          "HISTORICAL_BENEFICIAL_OWNER": "Historical_Beneficial_Owner",
          "INTERESTED_PERSON": "Interested_Person",
          "SETTLOR": "Settlor" },
        "templateName": "update-check-your-answers",
        "whoIsCompletingChangeLink": "/update-an-overseas-entity/who-is-making-update"
      }
    ));
  });

  it('during review if relevant period statement exists and update not set', async () => {
    (isRemoveJourney as jest.Mock).mockResolvedValue(false);
    (checkRPStatementsExist as jest.Mock).mockReturnValue(true);
    const mockAppData = { update: null };
    (fetchApplicationData as jest.Mock).mockResolvedValue(mockAppData);
    await getDataForReview(req as Request, res as Response, next as NextFunction, false);
    expect(getDataForReview).toBeDefined();
    expect(res.render).toHaveBeenCalledWith('update-check-your-answers', expect.objectContaining(
      { "FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC": false,
        "backLinkUrl": "/update-an-overseas-entity/update-registrable-beneficial-owner",
        "changeLinkUrl": "/update-an-overseas-entity/entity",
        "overseasEntityHeading": "Overseas entity details",
        "pageParams": { "hasAnyBosWithTrusteeNocs": false,
          "isRPStatementExists": true,
          "isRegistration": false,
          "isTrustFeatureEnabled": false,
          "noChangeFlag": false,
          "no_change": '',
          "relevantPeriodStatements": false },
        "roleTypes": { "BENEFICIARY": "Beneficiary",
          "GRANTOR": "Grantor",
          "HISTORICAL_BENEFICIAL_OWNER": "Historical_Beneficial_Owner",
          "INTERESTED_PERSON": "Interested_Person",
          "SETTLOR": "Settlor" },
        "templateName": "update-check-your-answers",
        "whoIsCompletingChangeLink": "/update-an-overseas-entity/who-is-making-update"
      }
    ));
  });

  it('should not display statements on update-check-your-answers page if relevantPeriodStatements is true', async () => {
    await getDataForReview(req as Request, res as Response, next as NextFunction, false);
    expect(getDataForReview).toBeDefined();
    expect(res.render).not.toHaveBeenCalledWith('update-check-your-answers', expect.objectContaining({
      pageParams: expect.objectContaining({
        "relevantPeriodStatements": true,
      }),
    }));
  });

  it('should render the page with relevantPeriodstatements set to true', async () => {
    (isRemoveJourney as jest.Mock).mockResolvedValue(false);
    (checkRPStatementsExist as jest.Mock).mockReturnValue(true);
    // Mock the boolean value
    relevantPeriodStatementsState.has_answered_relevant_period_question = true ;
    const mockAppData = { update: null };
    (fetchApplicationData as jest.Mock).mockResolvedValue(mockAppData);
    await getDataForReview(req as Request, res as Response, next as NextFunction, false);
    expect(getDataForReview).toBeDefined();
    expect(res.render).toHaveBeenCalledWith('update-check-your-answers', expect.objectContaining(
      { "FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC": false,
        "backLinkUrl": "/update-an-overseas-entity/update-registrable-beneficial-owner",
        "changeLinkUrl": "/update-an-overseas-entity/entity",
        "overseasEntityHeading": "Overseas entity details",
        "pageParams": { "hasAnyBosWithTrusteeNocs": false,
          "isRPStatementExists": true,
          "isRegistration": false,
          "isTrustFeatureEnabled": false,
          "noChangeFlag": false,
          "no_change": '',
          "relevantPeriodStatements": true },
        "roleTypes": { "BENEFICIARY": "Beneficiary",
          "GRANTOR": "Grantor",
          "HISTORICAL_BENEFICIAL_OWNER": "Historical_Beneficial_Owner",
          "INTERESTED_PERSON": "Interested_Person",
          "SETTLOR": "Settlor" },
        "templateName": "update-check-your-answers",
        "whoIsCompletingChangeLink": "/update-an-overseas-entity/who-is-making-update"
      }
    ));
  });

});

