jest.mock('../../src/utils/feature.flag');

import { Request } from "express";
import { beforeEach, describe, expect, test } from '@jest/globals';

import {
  getApplicationData,
  setApplicationData,
  prepareData,
  deleteApplicationData,
  mapDataObjectToFields,
  mapFieldsToDataObject,
  removeFromApplicationData,
  getFromApplicationData,
  checkBOsDetailsEntered,
  checkMOsDetailsEntered,
  findBoOrMo,
  checkGivenBoOrMoDetailsExist,
  allBeneficialOwners,
  checkActiveBOExists,
  hasAddedOrCeasedBO,
  checkActiveMOExists,
  allManagingOfficers,
  getRemove,
  setBoNocDataAsArrays
} from "../../src/utils/application.data";
import {
  APPLICATION_DATA_UPDATE_BO_MOCK,
  BO_IND_ID,
  BO_OTHER_ID,
  BO_GOV_ID,
  SERVICE_ADDRESS_MOCK,
  APPLICATION_DATA_MOCK,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  ENTITY_OBJECT_MOCK,
  getSessionRequestWithExtraData,
  getSessionRequestWithPermission,
  MO_IND_ID,
  MO_CORP_ID,
  BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
  BENEFICIAL_OWNER_GOV_OBJECT_MOCK,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_CH_REF,
  BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_CH_REF,
  BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_CH_REF,
  UPDATE_OWNERS_DATA_WITH_VALUE,
  UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  REVIEW_BENEFICIAL_OWNER_GOV_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA,
  UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_REQ_MOCK,
  APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW,
  APPLICATION_DATA_MOCK_NEWLY_ADDED_BO,
  UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK,
  MANAGING_OFFICER_OBJECT_MOCK,
  MANAGING_OFFICER_CORPORATE_OBJECT_MOCK,
  UPDATE_MANAGING_OFFICER_OBJECT_MOCK
} from "../__mocks__/session.mock";
import {
  PARAM_BENEFICIAL_OWNER_GOV,
  PARAM_BENEFICIAL_OWNER_INDIVIDUAL,
  PARAM_BENEFICIAL_OWNER_OTHER,
  PARAM_MANAGING_OFFICER_CORPORATE,
  PARAM_MANAGING_OFFICER_INDIVIDUAL
} from "../..//src/config";
import { ADDRESS } from "../__mocks__/fields/address.mock";
import { ApplicationData, beneficialOwnerIndividualType, dataType, entityType } from "../../src/model";
import { ServiceAddressKeys } from '../../src/model/address.model';
import { BeneficialOwnerGov, BeneficialOwnerGovKey } from '../../src/model/beneficial.owner.gov.model';
import { BeneficialOwnerIndividualKey } from "../../src/model/beneficial.owner.individual.model";
import { BeneficialOwnerOtherKey } from "../../src/model/beneficial.owner.other.model";
import { ManagingOfficerCorporateKey } from "../../src/model/managing.officer.corporate.model";
import { ManagingOfficerKey } from "../../src/model/managing.officer.model";
import { NoChangeKey, UpdateKey } from "../../src/model/update.type.model";
import { NatureOfControlType } from "../../src/model/data.types.model";
import { isActiveFeature } from "../../src/utils/feature.flag";

let req: Request;

const mockIsActiveFeature = isActiveFeature as jest.Mock;

describe("Application data utils", () => {

  beforeEach(() => {
    req = { headers: {} } as Request;
  });

  test("getApplicationData should return Extra data store in the session", () => {
    const session = getSessionRequestWithExtraData();
    const data = getApplicationData(session);
    expect(data).toEqual(APPLICATION_DATA_MOCK);
  });

  test("getApplicationData should return empty object if session undefined", () => {
    expect(getApplicationData(undefined)).toEqual({});
  });

  test("setApplicationData should store application data into the session", () => {
    const session = getSessionRequestWithExtraData();
    setApplicationData(session, ENTITY_OBJECT_MOCK, entityType.EntityKey);

    const data = getApplicationData(session);
    expect(data).toEqual( { ...APPLICATION_DATA_MOCK, [entityType.EntityKey]: { ...ENTITY_OBJECT_MOCK } });
  });

  test("setApplicationData should store application data into the session for an empty array type object (BOs)", () => {
    const session = getSessionRequestWithPermission();
    setApplicationData(
      session,
      BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
      beneficialOwnerIndividualType.BeneficialOwnerIndividualKey
    );

    expect(getApplicationData(session)).toEqual({
      [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [
        BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
      ],
    });
  });

  test("setApplicationData should return undefined if session is not defined", () => {
    // Session at this level can not be undefined, avoid checking req.session type, so
    // we return void if everything is ok, otherwise undefined, where void is not an alias for undefined.
    expect(setApplicationData(undefined, ENTITY_OBJECT_MOCK, entityType.EntityKey)).toEqual(undefined);
  });

  test("prepareData should store application data into the session", () => {
    const data = prepareData(ENTITY_OBJECT_MOCK, ['legal_form', 'email']);
    const { legal_form, email } = ENTITY_OBJECT_MOCK;
    expect(data).toEqual( { legal_form, email } );
  });

  test("deleteApplicationData should return undefined if session is undefined", () => {
    const data = deleteApplicationData(undefined);
    expect(data).toEqual(undefined);
  });

  test("deleteApplicationData should delete stored application data from the session", () => {
    const sessionWithExtraData = getSessionRequestWithExtraData();
    const sessionWithOutExtraData = getSessionRequestWithPermission();
    const response = deleteApplicationData(sessionWithExtraData);

    expect(response).toEqual(true);
    expect(sessionWithExtraData).toEqual( sessionWithOutExtraData );
  });

  test("mapDataObjectToFields should map address to address fields present on the view", () => {
    const response = mapDataObjectToFields(ADDRESS, ServiceAddressKeys, dataType.AddressKeys);
    expect(response).toEqual(SERVICE_ADDRESS_MOCK);
  });

  test("mapDataObjectToFields should return empty object when data is blank", () => {
    const response = mapDataObjectToFields(null, ServiceAddressKeys, dataType.AddressKeys);
    expect(response).toEqual({});
  });

  test('checkBOsDetailsEntered should be truthy if at least one BOs is present', () => {
    const response = checkBOsDetailsEntered(APPLICATION_DATA_MOCK);
    expect(response).toEqual(true);
  });

  test('checkBOsDetailsEntered should be truthy if BOC is present', () => {
    const response = checkBOsDetailsEntered({
      ...APPLICATION_DATA_MOCK,
      [BeneficialOwnerIndividualKey]: undefined,
      [BeneficialOwnerGovKey]: undefined
    });
    expect(response).toEqual(true);
  });

  test('checkBOsDetailsEntered should be truthy if BOG is present', () => {
    const response = checkBOsDetailsEntered({
      ...APPLICATION_DATA_MOCK,
      [BeneficialOwnerIndividualKey]: undefined,
      [BeneficialOwnerOtherKey]: undefined
    });
    expect(response).toEqual(true);
  });

  test('checkMOsDetailsEntered should be truthy if at least one MOs is present', () => {
    const response = checkMOsDetailsEntered(APPLICATION_DATA_MOCK);
    expect(response).toEqual(true);
  });

  test('checkMOsDetailsEntered should be truthy if MOC is present', () => {
    const response = checkMOsDetailsEntered({
      ...APPLICATION_DATA_MOCK,
      [ManagingOfficerKey]: undefined
    });
    expect(response).toEqual(true);
  });

  test('checkBOsDetailsEntered should be falsy if no BOs are present', () => {
    const response = checkBOsDetailsEntered({
      ...APPLICATION_DATA_MOCK,
      [BeneficialOwnerIndividualKey]: undefined,
      [BeneficialOwnerOtherKey]: undefined,
      [BeneficialOwnerGovKey]: undefined
    });
    expect(response).toEqual(false);
  });

  test('checkMOsDetailsEntered should be falsy if no MOs are present', () => {
    const response = checkMOsDetailsEntered({
      ...APPLICATION_DATA_MOCK,
      [ManagingOfficerKey]: undefined,
      [ManagingOfficerCorporateKey]: undefined
    });
    expect(response).toEqual(false);
  });

  test('findBoOrMo should return BO Individual if valid data given', () => {
    const beneficialOwner = findBoOrMo(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_BENEFICIAL_OWNER_INDIVIDUAL,
      BO_IND_ID
    );
    expect(beneficialOwner.id).toEqual(BO_IND_ID);
  });

  test('findBoOrMo should return BO Gov if valid data given', () => {
    const beneficialOwner = findBoOrMo(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_BENEFICIAL_OWNER_GOV,
      BO_GOV_ID
    );
    expect(beneficialOwner.id).toEqual(BO_GOV_ID);
  });

  test('findBoOrMo should return BO Other if valid data given', () => {
    const beneficialOwner = findBoOrMo(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_BENEFICIAL_OWNER_OTHER,
      BO_OTHER_ID
    );
    expect(beneficialOwner.id).toEqual(BO_OTHER_ID);
  });

  test('findBoOrMo should return MO Individual if valid data given', () => {
    const managingOfficer = findBoOrMo(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_MANAGING_OFFICER_INDIVIDUAL,
      MO_IND_ID
    );
    expect(managingOfficer.id).toEqual(MO_IND_ID);
  });

  test('findBoOrMo should return MO Corporate if valid data given', () => {
    const managingOfficer = findBoOrMo(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_MANAGING_OFFICER_CORPORATE,
      MO_CORP_ID
    );
    expect(managingOfficer.id).toEqual(MO_CORP_ID);
  });

  test('findBoOrMo should return undefined if invalid id given', () => {
    const beneficialOwner = findBoOrMo(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_BENEFICIAL_OWNER_OTHER,
      'fake-id'
    );
    expect(beneficialOwner).toEqual(undefined);
  });

  test('findBoOrMo should return undefined if invalid BO or MO type given', () => {
    const boOrMo = findBoOrMo(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      'not-a-real-bo-type',
      BO_OTHER_ID
    );
    expect(boOrMo).toEqual(undefined);
  });

  test('ensure single BO Nature of Control values are converted to arrays', () => {
    const beneficialOwnerIndividual = {
      ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
      beneficial_owner_nature_of_control_types: NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL,
      trustees_nature_of_control_types: NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL,
      non_legal_firm_members_nature_of_control_types: NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL
    };

    setBoNocDataAsArrays(
      beneficialOwnerIndividual
    );

    expect(beneficialOwnerIndividual.beneficial_owner_nature_of_control_types).toEqual([ NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL ]);
    expect(beneficialOwnerIndividual.trustees_nature_of_control_types).toEqual([ NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL ]);
    expect(beneficialOwnerIndividual.non_legal_firm_members_nature_of_control_types).toEqual([ NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL ]);
  });

  test('ensure arrays of BO Nature of Control values remain as arrays', () => {
    const testNocArray = [ NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL,
      NatureOfControlType.OVER_25_PERCENT_OF_SHARES ];

    const beneficialOwnerIndividual = {
      ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
      beneficial_owner_nature_of_control_types: testNocArray,
      trustees_nature_of_control_types: testNocArray,
      non_legal_firm_members_nature_of_control_types: testNocArray
    };

    setBoNocDataAsArrays(
      beneficialOwnerIndividual
    );

    expect(beneficialOwnerIndividual.beneficial_owner_nature_of_control_types).toEqual(testNocArray);
    expect(beneficialOwnerIndividual.trustees_nature_of_control_types).toEqual(testNocArray);
    expect(beneficialOwnerIndividual.non_legal_firm_members_nature_of_control_types).toEqual(testNocArray);
  });

  test('ensure empty BO Nature of Control values are converted to empty arrays', () => {
    const beneficialOwnerIndividual = {
      ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
      beneficial_owner_nature_of_control_types: "",
      trustees_nature_of_control_types: "",
      non_legal_firm_members_nature_of_control_types: ""
    };

    setBoNocDataAsArrays(
      beneficialOwnerIndividual
    );

    expect(beneficialOwnerIndividual.beneficial_owner_nature_of_control_types).toEqual([]);
    expect(beneficialOwnerIndividual.trustees_nature_of_control_types).toEqual([]);
    expect(beneficialOwnerIndividual.non_legal_firm_members_nature_of_control_types).toEqual([]);
  });

  test('ensure single BO Nature of Control values are converted to arrays when FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is ON', () => {
    mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

    const beneficialOwnerIndividual = {
      ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
      beneficial_owner_nature_of_control_types: NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL,
      trustees_nature_of_control_types: NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL,
      non_legal_firm_members_nature_of_control_types: NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL,
      trust_control_nature_of_control_types: NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL,
      non_legal_firm_control_nature_of_control_types: NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL,
      owner_of_land_person_nature_of_control_jurisdictions: NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL,
      owner_of_land_other_entity_nature_of_control_jurisdictions: NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL
    };

    setBoNocDataAsArrays(
      beneficialOwnerIndividual
    );

    expect(beneficialOwnerIndividual.beneficial_owner_nature_of_control_types).toEqual([ NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL ]);
    expect(beneficialOwnerIndividual.trustees_nature_of_control_types).toEqual([ NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL ]);
    expect(beneficialOwnerIndividual.non_legal_firm_members_nature_of_control_types).toEqual([ NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL ]);
    expect(beneficialOwnerIndividual.trust_control_nature_of_control_types).toEqual([ NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL ]);
    expect(beneficialOwnerIndividual.non_legal_firm_control_nature_of_control_types).toEqual([ NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL ]);
    expect(beneficialOwnerIndividual.owner_of_land_person_nature_of_control_jurisdictions).toEqual([ NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL ]);
    expect(beneficialOwnerIndividual.owner_of_land_other_entity_nature_of_control_jurisdictions).toEqual([ NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL ]);
  });

  test('ensure arrays of BO Nature of Control values remain as arrays when FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is ON', () => {
    mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

    const testNocArray = [ NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL,
      NatureOfControlType.OVER_25_PERCENT_OF_SHARES ];

    const beneficialOwnerIndividual = {
      ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
      beneficial_owner_nature_of_control_types: testNocArray,
      trustees_nature_of_control_types: testNocArray,
      non_legal_firm_members_nature_of_control_types: testNocArray,
      trust_control_nature_of_control_types: testNocArray,
      non_legal_firm_control_nature_of_control_types: testNocArray,
      owner_of_land_person_nature_of_control_jurisdictions: testNocArray,
      owner_of_land_other_entity_nature_of_control_jurisdictions: testNocArray
    };

    setBoNocDataAsArrays(
      beneficialOwnerIndividual
    );

    expect(beneficialOwnerIndividual.beneficial_owner_nature_of_control_types).toEqual(testNocArray);
    expect(beneficialOwnerIndividual.trustees_nature_of_control_types).toEqual(testNocArray);
    expect(beneficialOwnerIndividual.non_legal_firm_members_nature_of_control_types).toEqual(testNocArray);
    expect(beneficialOwnerIndividual.trust_control_nature_of_control_types).toEqual(testNocArray);
    expect(beneficialOwnerIndividual.non_legal_firm_control_nature_of_control_types).toEqual(testNocArray);
    expect(beneficialOwnerIndividual.owner_of_land_person_nature_of_control_jurisdictions).toEqual(testNocArray);
    expect(beneficialOwnerIndividual.owner_of_land_other_entity_nature_of_control_jurisdictions).toEqual(testNocArray);
  });

  test('ensure empty BO Nature of Control values are converted to empty arrays when FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is ON', () => {
    mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

    const beneficialOwnerIndividual = {
      ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
      beneficial_owner_nature_of_control_types: "",
      trustees_nature_of_control_types: "",
      non_legal_firm_members_nature_of_control_types: "",
      trust_control_nature_of_control_types: "",
      non_legal_firm_control_nature_of_control_types: "",
      owner_of_land_person_nature_of_control_jurisdictions: "",
      owner_of_land_other_entity_nature_of_control_jurisdictions: ""
    };

    setBoNocDataAsArrays(
      beneficialOwnerIndividual
    );

    expect(beneficialOwnerIndividual.beneficial_owner_nature_of_control_types).toEqual([]);
    expect(beneficialOwnerIndividual.trustees_nature_of_control_types).toEqual([]);
    expect(beneficialOwnerIndividual.non_legal_firm_members_nature_of_control_types).toEqual([]);
    expect(beneficialOwnerIndividual.trust_control_nature_of_control_types).toEqual([]);
    expect(beneficialOwnerIndividual.non_legal_firm_control_nature_of_control_types).toEqual([]);
    expect(beneficialOwnerIndividual.owner_of_land_person_nature_of_control_jurisdictions).toEqual([]);
    expect(beneficialOwnerIndividual.owner_of_land_other_entity_nature_of_control_jurisdictions).toEqual([]);
  });

  test('checkGivenBoOrMoDetailsExist returns true if beneficial owner is found', () => {
    expect(checkGivenBoOrMoDetailsExist(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_BENEFICIAL_OWNER_GOV,
      BO_GOV_ID
    )).toEqual(true);
  });

  test('checkGivenBoOrMoDetailsExist returns false if beneficial owner not found', () => {
    expect(checkGivenBoOrMoDetailsExist(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_BENEFICIAL_OWNER_GOV,
      'fake-id'
    )).toEqual(false);
  });

  test('checkGivenBoOrMoDetailsExist returns true if managing officer is found', () => {
    expect(checkGivenBoOrMoDetailsExist(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_MANAGING_OFFICER_INDIVIDUAL,
      MO_IND_ID
    )).toEqual(true);
  });

  test('checkGivenBoOrMoDetailsExist returns false if managing officer not found', () => {
    expect(checkGivenBoOrMoDetailsExist(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_MANAGING_OFFICER_INDIVIDUAL,
      'fake-id'
    )).toEqual(false);
  });

  test("mapFieldsToDataObject should map address fields coming from the view to address", () => {
    const response = mapFieldsToDataObject(SERVICE_ADDRESS_MOCK, ServiceAddressKeys, dataType.AddressKeys);
    expect(response).toEqual(ADDRESS);
  });

  test("mapFieldsToDataObject should return empty object when data is blank", () => {
    const response = mapFieldsToDataObject(null, ServiceAddressKeys, dataType.AddressKeys);
    expect(response).toEqual({});
  });

  test("removeFromApplicationData should remove specified object from data", () => {
    const session = getSessionRequestWithExtraData();
    req.session = session;
    let data = getApplicationData(session);
    const boGov = data[BeneficialOwnerGovKey]?.find(boGov => boGov.id === BO_GOV_ID);
    expect(boGov).not.toBeUndefined();

    removeFromApplicationData(req, BeneficialOwnerGovKey, BO_GOV_ID);

    data = getApplicationData(session);
    expect(data[BeneficialOwnerGovKey]?.find(boGov => boGov.id === BO_GOV_ID)).toBeUndefined();

    // restore the boGov object so other tests don't fail as data does not get reset
    if (boGov) {
      data[BeneficialOwnerGovKey]?.push(boGov);
    }
    expect(data[BeneficialOwnerGovKey]?.find(boGov => boGov.id === BO_GOV_ID)).not.toBeUndefined();
  });

  test("removeFromApplicationData should throw error when id not found", () => {
    const session = getSessionRequestWithExtraData();
    req.session = session;
    expect(() => removeFromApplicationData(req, BeneficialOwnerGovKey, "no id")).toThrow(`${BeneficialOwnerGovKey}`);
  });

  test("getFromApplicationData should return specified object from data", () => {
    const session = getSessionRequestWithExtraData();
    req.session = session;
    const boGov: BeneficialOwnerGov = getFromApplicationData(req, BeneficialOwnerGovKey, BO_GOV_ID);

    expect(boGov).not.toBeUndefined();
    expect(boGov.id).toEqual(BO_GOV_ID);
  });

  test("getFromApplicationData should throw error when id not found", () => {
    const session = getSessionRequestWithExtraData();
    req.session = session;
    expect(() => getFromApplicationData(req, BeneficialOwnerGovKey, "no id")).toThrow(`${BeneficialOwnerGovKey}`);
  });

  test("getFromApplicationData should throw error when id undefined", () => {
    const session = getSessionRequestWithExtraData();
    req.session = session;
    expect(() => getFromApplicationData(req, BeneficialOwnerGovKey, undefined as unknown as string)).toThrow(`${BeneficialOwnerGovKey}`);
  });

  test("getFromApplicationData should return undefined if error boolean false and id not found", () => {
    const session = getSessionRequestWithExtraData();
    req.session = session;
    const bo: BeneficialOwnerGov = getFromApplicationData(req, BeneficialOwnerGovKey, "no id", false);
    expect(bo).toBeUndefined;
  });

  test("getFromApplicationData should return undefined if error boolean false and id undefined", () => {
    const session = getSessionRequestWithPermission();
    req.session = session;
    const bo: BeneficialOwnerGov = getFromApplicationData(req, BeneficialOwnerGovKey, undefined as unknown as string, false);
    expect(bo).toBeUndefined;
  });

  test.each([
    [
      "1 individual BO",
      BeneficialOwnerIndividualKey,
      BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK
    ],
    [
      "1 other BO",
      BeneficialOwnerOtherKey,
      BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
    ],
    [
      "1 gov BO",
      BeneficialOwnerGovKey,
      BENEFICIAL_OWNER_GOV_OBJECT_MOCK,
    ]
  ])(`allBeneficialOwners with %s returns expected`, (_, boKey, boMock) => {
    const allBOs = allBeneficialOwners({ [boKey]: [boMock] });

    expect(allBOs).toEqual([boMock]);
  });

  test.each([
    [
      "1 individual BO for review",
      "review_beneficial_owners_individual",
      BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_CH_REF
    ],
    [
      "1 other BO for review",
      "review_beneficial_owners_corporate",
      BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_CH_REF
    ],
    [
      "1 gov BO for review",
      "review_beneficial_owners_government_or_public_authority",
      BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_CH_REF
    ],
  ])(`allBeneficialOwners with %s returns expected array`, (_, boKey, boMock) => {
    const allBOs = allBeneficialOwners({ [UpdateKey]: { [boKey]: [boMock], [NoChangeKey]: true } });

    expect(allBOs).toEqual([boMock]);
  });

  test.each([
    [
      "1 reviewed BO returns true",
      BeneficialOwnerGovKey,
      BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_CH_REF,
      false
    ],
    [
      "1 added BO returns false",
      BeneficialOwnerIndividualKey,
      BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
      true
    ],
    [
      "1 ceased BO returns false",
      BeneficialOwnerOtherKey,
      BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_CH_REF,
      true
    ]
  ])(`hasNotAddedOrCeasedBos with %s`, (_, boKey, boMock, expectedReturn) => {
    const notAddedOrCeasedBos = hasAddedOrCeasedBO({ [boKey]: [boMock] });

    expect(notAddedOrCeasedBos).toEqual(expectedReturn);
  });

  test("allBeneficialOwners with 1 of each BO type returns array of all for update", () => {
    const mockAppData = { ...APPLICATION_DATA_MOCK };
    mockAppData.update = { ...APPLICATION_DATA_MOCK.update, [NoChangeKey]: false };
    const allBOs = allBeneficialOwners(mockAppData);

    expect(allBOs).toEqual([
      BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
      BENEFICIAL_OWNER_GOV_OBJECT_MOCK,
      BENEFICIAL_OWNER_OTHER_OBJECT_MOCK
    ]);
  });

  test("allBeneficialOwners with 1 of each BO type returns array of all for no change", () => {
    const mockAppData = { [UpdateKey]: { ...UPDATE_OWNERS_DATA_WITH_VALUE, [NoChangeKey]: true } };
    const allBOs = allBeneficialOwners(mockAppData);

    expect(allBOs).toEqual([
      UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
      REVIEW_BENEFICIAL_OWNER_GOV_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA,
      UPDATE_REVIEW_BENEFICIAL_OWNER_OTHER_REQ_MOCK
    ]);
  });

  test.each([
    [
      "no beneficial owners returns false",
      APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW,
      false
    ],
    [
      "no active beneficial owners returns false",
      { ...APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW, [BeneficialOwnerIndividualKey]: [BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_CH_REF] },
      false
    ],
    [
      "1 active beneficial owner, with no ceased_date key, returns true",
      { ...APPLICATION_DATA_MOCK_NEWLY_ADDED_BO, [UpdateKey]: { [NoChangeKey]: false } },
      true
    ],
    [
      "1 active beneficial owner, with empty ceased_date, returns true",
      { ...APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW, [BeneficialOwnerIndividualKey]: [UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK], [UpdateKey]: { [NoChangeKey]: false } },
      true
    ]
  ])(`checkActiveBOExists with %s returns expected array`, (_, appData, expectedResult) => {
    expect(checkActiveBOExists(appData)).toBe(expectedResult);
  });

  test.each([
    [
      "1 managing officer",
      ManagingOfficerKey,
      MANAGING_OFFICER_OBJECT_MOCK
    ],
    [
      "1 managing officer corporate",
      ManagingOfficerCorporateKey,
      MANAGING_OFFICER_CORPORATE_OBJECT_MOCK,
    ]
  ])(`allManagingOfficers with %s returns expected`, (_, moKey, moMock) => {
    const allMOs = allManagingOfficers({ [moKey]: [moMock] });

    expect(allMOs).toEqual([moMock]);
  });

  test.each([
    [
      "1 managing officer for review",
      "review_managing_officers_individual",
      MANAGING_OFFICER_OBJECT_MOCK
    ],
    [
      "1 managing officer corporate for review",
      "review_managing_officers_corporate",
      MANAGING_OFFICER_CORPORATE_OBJECT_MOCK
    ]
  ])(`allManagingOfficers with %s returns expected array`, (_, moKey, moMock) => {
    const allMOs = allManagingOfficers({ [UpdateKey]: { [moKey]: [moMock], [NoChangeKey]: true } });

    expect(allMOs).toEqual([moMock]);
  });

  test.each([
    [
      "no managing officers returns false",
      APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW,
      false
    ],
    [
      "no active managing officer returns false",
      { ...APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW, [ManagingOfficerKey]: [UPDATE_MANAGING_OFFICER_OBJECT_MOCK], [UpdateKey]: { [NoChangeKey]: false } },
      false
    ],
    [
      "1 active managing officer, with no resigned_on key, returns true",
      { ...APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW, [ManagingOfficerKey]: [MANAGING_OFFICER_OBJECT_MOCK], [UpdateKey]: { [NoChangeKey]: false } },
      true
    ],
    [
      "1 active managing officer, with empty resigned_on, returns true",
      { ...APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW, [ManagingOfficerKey]:
        [{ ...MANAGING_OFFICER_OBJECT_MOCK, resigned_on: {} }],
      [UpdateKey]: { [NoChangeKey]: false }
      },
      true
    ]
  ])(`checkActiveMOExists with %s returns expected array`, (_, appData, expectedResult) => {
    expect(checkActiveMOExists(appData)).toBe(expectedResult);
  });

  test.each([
    [
      "no managing officers returns false",
      { ...APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW, [UpdateKey]: { [NoChangeKey]: true } },
      false
    ],
    [
      "no active managing officer returns false",
      { ...APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW, [UpdateKey]: { [NoChangeKey]: true, ["review_managing_officers_individual"]: [UPDATE_MANAGING_OFFICER_OBJECT_MOCK] } },
      false
    ],
    [
      "1 active managing officer, with no resigned_on key, returns true",
      { ...APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW, [UpdateKey]: { [NoChangeKey]: true, ["review_managing_officers_individual"]: [MANAGING_OFFICER_OBJECT_MOCK] } },
      true
    ],
    [
      "1 active managing officer, with empty resigned_on, returns true",
      { ...APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW,
        [UpdateKey]: { [NoChangeKey]: true, ["review_managing_officers_individual"]: [{ ...MANAGING_OFFICER_OBJECT_MOCK, resigned_on: {} }] }
      },
      true
    ]
  ])(`checkActiveMOExists when in no change with %s returns expected array`, (_, appData, expectedResult) => {
    expect(checkActiveMOExists(appData)).toBe(expectedResult);
  });

  test("getRemove returns an empty object if appData is empty", () => {
    const removeObject = getRemove({} as ApplicationData);
    expect(removeObject).toStrictEqual({});
  });

  test("getRemove returns an empty object if appData.remove is undefined", () => {
    const removeObject = getRemove({ remove: undefined } as ApplicationData);
    expect(removeObject).toStrictEqual({});
  });

  test("getRemove returns remove object", () => {
    const removeObject = { has_sold_all_land: '1' };
    const returnedRemoveObject = getRemove({ remove: removeObject } as ApplicationData);
    expect(returnedRemoveObject).toStrictEqual(removeObject);
  });
});
