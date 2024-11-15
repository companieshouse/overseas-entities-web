import { Request, Response, NextFunction } from 'express';
import { getDataForReview } from '../../src/utils/check.your.answers';
import { getApplicationData } from '../../src/utils/application.data';
import { isRemoveJourney } from '../../src/utils/url';
import { checkEntityReviewRequiresTrusts } from '../../src/utils/trusts';
import { checkRPStatementsExist } from '../../src/utils/relevant.period';
import { Session } from "@companieshouse/node-session-handler";

// Mock the required functions and modules
jest.mock('../../src/utils/application.data', () => ({ getApplicationData: jest.fn() }));
jest.mock('../../src/utils/logger');
jest.mock('../../src/utils/relevant.period', () => ({ checkRPStatementsExist: jest.fn() }));
jest.mock('../../src/utils/url', () => ({ isRemoveJourney: jest.fn() }));
jest.mock('../../src/utils/trusts', () => ({
  ...jest.requireActual('../../src/utils/trusts'),
  checkEntityReviewRequiresTrusts: jest.fn()
}));
jest.mock('../../src/utils/check.your.answers', () => ({
  ...jest.requireActual('../../src/utils/check.your.answers'),
  getBackLinkUrl: jest.fn(),
  getTemplateName: jest.fn()
}));

// Define and implement tests
describe('getDataForReview calls render for check your answers page', () => {

  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  beforeEach(() => {
    req = { session: {} as Session, method: 'GET', route: { path: '/review' } };
    res = { render: jest.fn() };
    next = jest.fn();
    (isRemoveJourney as jest.Mock).mockReset();
    (getApplicationData as jest.Mock).mockReset();
    (checkEntityReviewRequiresTrusts as jest.Mock).mockReset();
    (checkRPStatementsExist as jest.Mock).mockReset();
  });

  it('during update if relevant period statement exists and no_change is false', async () => {
    // Arrange
    (isRemoveJourney as jest.Mock).mockResolvedValue(false);
    (checkRPStatementsExist as jest.Mock).mockReturnValue(true);
    const mockAppData = { update: { no_change: false } };
    (getApplicationData as jest.Mock).mockResolvedValue(mockAppData);
    // Act
    await getDataForReview(req as Request, res as Response, next as NextFunction, false);
    // Assert
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
          "no_change": false },
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
    // Arrange
    (isRemoveJourney as jest.Mock).mockResolvedValue(false);
    (checkRPStatementsExist as jest.Mock).mockReturnValue(true);
    const mockAppData = { update: { no_change: true } };
    (getApplicationData as jest.Mock).mockResolvedValue(mockAppData);
    // Act
    await getDataForReview(req as Request, res as Response, next as NextFunction, false);
    // Assert
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
          "no_change": true },
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
    // Arrange
    (isRemoveJourney as jest.Mock).mockResolvedValue(false);
    (checkRPStatementsExist as jest.Mock).mockReturnValue(true);
    (checkEntityReviewRequiresTrusts as jest.Mock).mockReturnValue(false);
    const mockAppData = { update: { no_change: '' } };
    (getApplicationData as jest.Mock).mockResolvedValue(mockAppData);
    // Act
    await getDataForReview(req as Request, res as Response, next as NextFunction, false);
    // Assert
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
          "no_change": '' },
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
    // Arrange
    (isRemoveJourney as jest.Mock).mockResolvedValue(false);
    (checkRPStatementsExist as jest.Mock).mockReturnValue(true);
    const mockAppData = { update: null };
    (getApplicationData as jest.Mock).mockResolvedValue(mockAppData);
    // Act
    await getDataForReview(req as Request, res as Response, next as NextFunction, false);
    // Assert
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
          "no_change": '' },
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
