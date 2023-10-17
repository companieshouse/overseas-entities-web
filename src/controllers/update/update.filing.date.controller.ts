import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { isActiveFeature } from "../../utils/feature.flag";
import { getApplicationData, setExtraData, mapFieldsToDataObject, mapDataObjectToFields } from "../../utils/application.data";
import { postTransaction } from "../../service/transaction.service";
import { createOverseasEntity, updateOverseasEntity } from "../../service/overseas.entities.service";
import { OverseasEntityKey, Transactionkey, InputDateKeys, yesNoResponse } from '../../model/data.types.model';
import { FilingDateKey, FilingDateKeys } from '../../model/date.model';
import { ApplicationData } from "../../model/application.model";
import { RoleWithinTrustType } from "../../model/role.within.trust.type.model";
import { IndividualTrustee, TrustCorporate } from "../../model/trust.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData = getApplicationData(req.session);
    const filingDate = appData.update?.[FilingDateKey] ? mapDataObjectToFields(appData.update[FilingDateKey], FilingDateKeys, InputDateKeys) : {};

    return res.render(config.UPDATE_FILING_DATE_PAGE, {
      backLinkUrl: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
      templateName: config.UPDATE_FILING_DATE_PAGE,
      ...appData,
      [FilingDateKey]: filingDate
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async(req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME)) {
      const appData: ApplicationData = getApplicationData(session);
      if (!appData[Transactionkey]) {
        const transactionID = await postTransaction(req, session);
        appData[Transactionkey] = transactionID;
        appData[OverseasEntityKey] = await createOverseasEntity(req, session, transactionID, true);
      }
      if (appData.update) {
        appData.update[FilingDateKey] = mapFieldsToDataObject(req.body, FilingDateKeys, InputDateKeys);
        appData.update.review_trusts = [{

          trust_id: "1",

          trust_name: "Quail Kinney",

          creation_date_day: "12",

          creation_date_month: "6",

          creation_date_year: "2023",

          unable_to_obtain_all_trust_info: "No",

          INDIVIDUALS: [{

            id: "0ab5a70b-d0f2-46f1-a0af-182aaf30e7a9",

            type: RoleWithinTrustType.BENEFICIARY,

            forename: "Tanek",

            other_forenames: "",

            surname: "Kelly",

            dob_day: "10",

            dob_month: "6",

            dob_year: "2023",

            nationality: "Sierra Leonean",

            second_nationality: "Fijian",

            ura_address_premises: "Lila Sosa",

            ura_address_line_1: "918 White First Lane",

            ura_address_line_2: "Eiusmod ea voluptatu",

            ura_address_locality: "Ut ut commodo amet ",

            ura_address_region: "Quia pariatur Perfe",

            ura_address_country: "Cuba",

            ura_address_postal_code: "34379",

            ura_address_care_of: "",

            ura_address_po_box: "",

            is_service_address_same_as_usual_residential_address: yesNoResponse.No,

            sa_address_care_of: "",

            sa_address_po_box: "",

            sa_address_premises: "Yvette Klein",

            sa_address_line_1: "432 Old Parkway",

            sa_address_line_2: "Reiciendis enim ulla",

            sa_address_locality: "Dolor dolorem tenetu",

            sa_address_region: "Qui perferendis volu",

            sa_address_country: "Tunisia",

            sa_address_postal_code: "52216",
            ch_references: "test"

          } as IndividualTrustee,

          {

            id: "ebd75e11-6c2b-479a-b8ed-68a9639bb2ec",

            type: RoleWithinTrustType.SETTLOR,

            forename: "Tanek",

            other_forenames: "",

            surname: "Foreman",

            dob_day: "16",

            dob_month: "2",

            dob_year: "2023",

            nationality: "Trinidadian",

            second_nationality: "",

            ura_address_premises: "Yolanda Hall",

            ura_address_line_1: "849 West New Road",

            ura_address_line_2: "Tempor vitae commodo",

            ura_address_locality: "Veniam ipsam suscip",

            ura_address_region: "Consequuntur ullam a",

            ura_address_country: "England",

            ura_address_postal_code: "35975",

            ura_address_care_of: "",

            ura_address_po_box: "",

            is_service_address_same_as_usual_residential_address: yesNoResponse.Yes,

            sa_address_care_of: "",

            sa_address_po_box: "",

            sa_address_premises: "",

            sa_address_line_1: "",

            sa_address_line_2: "",

            sa_address_locality: "",

            sa_address_region: "",

            sa_address_country: "",

            sa_address_postal_code: "",
            ch_references: "test"

          } as IndividualTrustee,

          {

            id: "716f954a-892e-4101-af62-00e57b191f95",

            type: RoleWithinTrustType.GRANTOR,

            forename: "Barrett",

            other_forenames: "",

            surname: "Floyd",

            dob_day: "19",

            dob_month: "2",

            dob_year: "2023",

            nationality: "Sammarinese",

            second_nationality: "Ethiopian",

            ura_address_premises: "Portia Chambers",

            ura_address_line_1: "36 Cowley Parkway",

            ura_address_line_2: "Assumenda distinctio",

            ura_address_locality: "In dolorem iusto qua",

            ura_address_region: "Labore est in qui e",

            ura_address_country: "Austria",

            ura_address_postal_code: "70562",

            ura_address_care_of: "",

            ura_address_po_box: "",

            is_service_address_same_as_usual_residential_address: yesNoResponse.No,

            sa_address_care_of: "",

            sa_address_po_box: "",

            sa_address_premises: "Anthony Holmes",

            sa_address_line_1: "443 Old Extension",

            sa_address_line_2: "Tempore sunt volupt",

            sa_address_locality: "Ut qui qui nostrud v",

            sa_address_region: "Exercitation quod cu",

            sa_address_country: "Tunisia",

            sa_address_postal_code: "73641",
            ch_references: "test"

          } as IndividualTrustee,

          {

            id: "f81808f9-46f0-4cbc-87ea-a5b9066fe547",

            type: RoleWithinTrustType.INTERESTED_PERSON,

            forename: "Ifeoma",

            other_forenames: "",

            surname: "Hebert",

            dob_day: "15",

            dob_month: "2",

            dob_year: "2023",

            nationality: "Moroccan",

            second_nationality: "Citizen of Vanuatu",

            ura_address_premises: "Francis Spence",

            ura_address_line_1: "14 West Oak Road",

            ura_address_line_2: "Quaerat officia dolo",

            ura_address_locality: "Est non sequi qui ad",

            ura_address_region: "Ullamco vero ut ad c",

            ura_address_country: "Palau",

            ura_address_postal_code: "83960",

            ura_address_care_of: "",

            ura_address_po_box: "",

            is_service_address_same_as_usual_residential_address: yesNoResponse.Yes,

            sa_address_care_of: "",

            sa_address_po_box: "",

            date_became_interested_person_day: "23",

            date_became_interested_person_month: "2",

            date_became_interested_person_year: "2023",

            sa_address_premises: "",

            sa_address_line_1: "",

            sa_address_line_2: "",

            sa_address_locality: "",

            sa_address_region: "",

            sa_address_country: "",

            sa_address_postal_code: "",
            ch_references: "test"

          } as IndividualTrustee],

          HISTORICAL_BO: [{

            id: "8574560e-c196-4129-88c4-a44ebbecb53f",

            notified_date_day: "11",

            notified_date_month: "1",

            notified_date_year: "2023",

            ceased_date_day: "6",

            ceased_date_month: "6",

            ceased_date_year: "2023",

            corporate_indicator: 1,

            corporate_name: "Christen Jefferson",
            ch_references: "test"

          }, {

            id: "6185f399-0fe4-48c2-bb19-d6c0d9bea21c",

            notified_date_day: "13",

            notified_date_month: "1",

            notified_date_year: "2023",

            ceased_date_day: "14",

            ceased_date_month: "8",

            ceased_date_year: "2023",

            corporate_indicator: 0,

            forename: "Coby",

            surname: "Jordan",
            ch_references: "test"

          }],

          CORPORATES: [{

            id: "630da1fb-a7ff-42c7-b9b7-496ddf5ef2de",

            type: RoleWithinTrustType.BENEFICIARY,

            name: "Abigail Pruitt",

            date_became_interested_person_day: "5",

            date_became_interested_person_month: "5",

            date_became_interested_person_year: "2023",

            ro_address_premises: "Ariel Lancaster",

            ro_address_line_1: "728 Green Fabien Lane",

            ro_address_line_2: "Culpa eius voluptat",

            ro_address_locality: "Elit quod cupidatat",

            ro_address_region: "Voluptate eveniet f",

            ro_address_country: "Scotland",

            ro_address_postal_code: "58769",

            ro_address_care_of: "",

            ro_address_po_box: "",

            sa_address_care_of: "",

            sa_address_po_box: "",

            identification_legal_authority: "Nesciunt quidem qua",

            identification_legal_form: "Consequuntur tempora",

            is_service_address_same_as_principal_address: yesNoResponse.Yes,

            is_on_register_in_country_formed_in: 0,

            sa_address_premises: "",

            sa_address_line_1: "",

            sa_address_line_2: "",

            sa_address_locality: "",

            sa_address_region: "",

            sa_address_country: "",

            sa_address_postal_code: "",
            ch_references: "test"

          } as TrustCorporate,

          {

            id: "a3624116-6483-4023-ab7f-acd052af8484",

            type: RoleWithinTrustType.SETTLOR,

            name: "Kareem Cole",

            date_became_interested_person_day: "",

            date_became_interested_person_month: "",

            date_became_interested_person_year: "",

            ro_address_premises: "Tara Carney",

            ro_address_line_1: "611 Oak Court",

            ro_address_line_2: "Placeat voluptatem ",

            ro_address_locality: "Sint aute qui soluta",

            ro_address_region: "Ut maxime ex molesti",

            ro_address_country: "Slovakia",

            ro_address_postal_code: "17872",

            ro_address_care_of: "",

            ro_address_po_box: "",

            sa_address_care_of: "",

            sa_address_po_box: "",

            identification_legal_authority: "In provident assume",

            identification_legal_form: "Distinctio Aperiam ",

            is_service_address_same_as_principal_address: yesNoResponse.No,

            is_on_register_in_country_formed_in: 1,

            identification_place_registered: "Vincent Griffin",

            identification_country_registration: "Consequatur nostrum ",

            identification_registration_number: "559",

            sa_address_premises: "Herman Lloyd",

            sa_address_line_1: "491 Milton Boulevard",

            sa_address_line_2: "Est mollitia odit fu",

            sa_address_locality: "Dolore earum quis im",

            sa_address_region: "Veniam in Nam atque",

            sa_address_country: "New Caledonia",

            sa_address_postal_code: "21680",
            ch_references: "test"

          } as TrustCorporate,

          {

            id: "a8c4ae83-6416-4827-92a8-69804acbf2d7",

            type: RoleWithinTrustType.GRANTOR,

            name: "Luke Rodgers",

            date_became_interested_person_day: "",

            date_became_interested_person_month: "",

            date_became_interested_person_year: "",

            ro_address_premises: "Amber Munoz",

            ro_address_line_1: "12 West Rocky Old Drive",

            ro_address_line_2: "Quasi est iste eiusm",

            ro_address_locality: "Sunt commodo amet ",

            ro_address_region: "Autem delectus ut m",

            ro_address_country: "Palau",

            ro_address_postal_code: "22238",

            ro_address_care_of: "",

            ro_address_po_box: "",

            sa_address_care_of: "",

            sa_address_po_box: "",

            identification_legal_authority: "Provident modi labo",

            identification_legal_form: "Totam deleniti omnis",

            is_service_address_same_as_principal_address: yesNoResponse.Yes,

            is_on_register_in_country_formed_in: 0,

            sa_address_premises: "",

            sa_address_line_1: "",

            sa_address_line_2: "",

            sa_address_locality: "",

            sa_address_region: "",

            sa_address_country: "",

            sa_address_postal_code: "",
            ch_references: "test"

          } as TrustCorporate,

          {

            id: "ec206f77-c1fb-4800-aa16-41dc684bc6be",

            type: RoleWithinTrustType.INTERESTED_PERSON,

            name: "Reece Wilkins",

            date_became_interested_person_day: "12",

            date_became_interested_person_month: "2",

            date_became_interested_person_year: "2023",

            ro_address_premises: "Paul Henson",

            ro_address_line_1: "652 Rocky Milton Street",

            ro_address_line_2: "Sequi dolorem nihil ",

            ro_address_locality: "Qui tempora aut qui ",

            ro_address_region: "Occaecat ratione dol",

            ro_address_country: "Vatican City",

            ro_address_postal_code: "62938",

            ro_address_care_of: "",

            ro_address_po_box: "",

            sa_address_care_of: "",

            sa_address_po_box: "",

            identification_legal_authority: "Sapiente minim et om",

            identification_legal_form: "Qui nihil reiciendis",

            is_service_address_same_as_principal_address: yesNoResponse.No,

            is_on_register_in_country_formed_in: 0,

            sa_address_premises: "Jonas Ward",

            sa_address_line_1: "452 Oak Road",

            sa_address_line_2: "Praesentium sit arc",

            sa_address_locality: "Tempora iure consequ",

            sa_address_region: "Cupidatat aspernatur",

            sa_address_country: "Bulgaria",

            sa_address_postal_code: "29171",
            ch_references: "test"

          } as TrustCorporate,],

        }, {

          trust_id: "2",

          trust_name: "Dermott Franklin",

          creation_date_day: "1",

          creation_date_month: "4",

          creation_date_year: "2019",

          unable_to_obtain_all_trust_info: "No",

          INDIVIDUALS: [{

            id: "0ab5a70b-d0f2-46f1-a0af-182aaf30e7a9",

            type: RoleWithinTrustType.BENEFICIARY,

            forename: "Tanek",

            other_forenames: "",

            surname: "Kelly",

            dob_day: "10",

            dob_month: "6",

            dob_year: "2023",

            nationality: "Sierra Leonean",

            second_nationality: "Fijian",

            ura_address_premises: "Lila Sosa",

            ura_address_line_1: "918 White First Lane",

            ura_address_line_2: "Eiusmod ea voluptatu",

            ura_address_locality: "Ut ut commodo amet ",

            ura_address_region: "Quia pariatur Perfe",

            ura_address_country: "Cuba",

            ura_address_postal_code: "34379",

            ura_address_care_of: "",

            ura_address_po_box: "",

            is_service_address_same_as_usual_residential_address: yesNoResponse.No,

            sa_address_care_of: "",

            sa_address_po_box: "",

            sa_address_premises: "Yvette Klein",

            sa_address_line_1: "432 Old Parkway",

            sa_address_line_2: "Reiciendis enim ulla",

            sa_address_locality: "Dolor dolorem tenetu",

            sa_address_region: "Qui perferendis volu",

            sa_address_country: "Tunisia",

            sa_address_postal_code: "52216",
            ch_references: "test"

          } as IndividualTrustee,

          {

            id: "ebd75e11-6c2b-479a-b8ed-68a9639bb2ec",

            type: RoleWithinTrustType.SETTLOR,

            forename: "Tanek",

            other_forenames: "",

            surname: "Foreman",

            dob_day: "16",

            dob_month: "2",

            dob_year: "2023",

            nationality: "Trinidadian",

            second_nationality: "",

            ura_address_premises: "Yolanda Hall",

            ura_address_line_1: "849 West New Road",

            ura_address_line_2: "Tempor vitae commodo",

            ura_address_locality: "Veniam ipsam suscip",

            ura_address_region: "Consequuntur ullam a",

            ura_address_country: "England",

            ura_address_postal_code: "35975",

            ura_address_care_of: "",

            ura_address_po_box: "",

            is_service_address_same_as_usual_residential_address: yesNoResponse.Yes,

            sa_address_care_of: "",

            sa_address_po_box: "",

            sa_address_premises: "",

            sa_address_line_1: "",

            sa_address_line_2: "",

            sa_address_locality: "",

            sa_address_region: "",

            sa_address_country: "",

            sa_address_postal_code: "",
            ch_references: "test"

          } as IndividualTrustee,

          {

            id: "716f954a-892e-4101-af62-00e57b191f95",

            type: RoleWithinTrustType.GRANTOR,

            forename: "Barrett",

            other_forenames: "",

            surname: "Floyd",

            dob_day: "19",

            dob_month: "2",

            dob_year: "2023",

            nationality: "Sammarinese",

            second_nationality: "Ethiopian",

            ura_address_premises: "Portia Chambers",

            ura_address_line_1: "36 Cowley Parkway",

            ura_address_line_2: "Assumenda distinctio",

            ura_address_locality: "In dolorem iusto qua",

            ura_address_region: "Labore est in qui e",

            ura_address_country: "Austria",

            ura_address_postal_code: "70562",

            ura_address_care_of: "",

            ura_address_po_box: "",

            is_service_address_same_as_usual_residential_address: yesNoResponse.No,

            sa_address_care_of: "",

            sa_address_po_box: "",

            sa_address_premises: "Anthony Holmes",

            sa_address_line_1: "443 Old Extension",

            sa_address_line_2: "Tempore sunt volupt",

            sa_address_locality: "Ut qui qui nostrud v",

            sa_address_region: "Exercitation quod cu",

            sa_address_country: "Tunisia",

            sa_address_postal_code: "73641",
            ch_references: "test"

          } as IndividualTrustee,

          {

            id: "f81808f9-46f0-4cbc-87ea-a5b9066fe547",

            type: RoleWithinTrustType.INTERESTED_PERSON,

            forename: "Ifeoma",

            other_forenames: "",

            surname: "Hebert",

            dob_day: "15",

            dob_month: "2",

            dob_year: "2023",

            nationality: "Moroccan",

            second_nationality: "Citizen of Vanuatu",

            ura_address_premises: "Francis Spence",

            ura_address_line_1: "14 West Oak Road",

            ura_address_line_2: "Quaerat officia dolo",

            ura_address_locality: "Est non sequi qui ad",

            ura_address_region: "Ullamco vero ut ad c",

            ura_address_country: "Palau",

            ura_address_postal_code: "83960",

            ura_address_care_of: "",

            ura_address_po_box: "",

            is_service_address_same_as_usual_residential_address: yesNoResponse.Yes,

            sa_address_care_of: "",

            sa_address_po_box: "",

            date_became_interested_person_day: "23",

            date_became_interested_person_month: "2",

            date_became_interested_person_year: "2023",

            sa_address_premises: "",

            sa_address_line_1: "",

            sa_address_line_2: "",

            sa_address_locality: "",

            sa_address_region: "",

            sa_address_country: "",

            sa_address_postal_code: "",
            ch_references: "test"

          } as IndividualTrustee],

          HISTORICAL_BO: [{

            id: "8574560e-c196-4129-88c4-a44ebbecb53f",

            notified_date_day: "11",

            notified_date_month: "1",

            notified_date_year: "2023",

            ceased_date_day: "6",

            ceased_date_month: "6",

            ceased_date_year: "2023",

            corporate_indicator: 1,

            corporate_name: "Christen Jefferson",
            ch_references: "test"

          },

          {

            id: "6185f399-0fe4-48c2-bb19-d6c0d9bea21c",

            notified_date_day: "13",

            notified_date_month: "1",

            notified_date_year: "2023",

            ceased_date_day: "14",

            ceased_date_month: "8",

            ceased_date_year: "2023",

            corporate_indicator: 0,

            forename: "Coby",

            surname: "Jordan",
            ch_references: "test"

          }],

          CORPORATES: [{

            id: "630da1fb-a7ff-42c7-b9b7-496ddf5ef2de",

            type: RoleWithinTrustType.BENEFICIARY,

            name: "Abigail Pruitt",

            date_became_interested_person_day: "5",

            date_became_interested_person_month: "5",

            date_became_interested_person_year: "2023",

            ro_address_premises: "Ariel Lancaster",

            ro_address_line_1: "728 Green Fabien Lane",

            ro_address_line_2: "Culpa eius voluptat",

            ro_address_locality: "Elit quod cupidatat",

            ro_address_region: "Voluptate eveniet f",

            ro_address_country: "Scotland",

            ro_address_postal_code: "58769",

            ro_address_care_of: "",

            ro_address_po_box: "",

            sa_address_care_of: "",

            sa_address_po_box: "",

            identification_legal_authority: "Nesciunt quidem qua",

            identification_legal_form: "Consequuntur tempora",

            is_service_address_same_as_principal_address: yesNoResponse.Yes,

            is_on_register_in_country_formed_in: 0,

            sa_address_premises: "",

            sa_address_line_1: "",

            sa_address_line_2: "",

            sa_address_locality: "",

            sa_address_region: "",

            sa_address_country: "",

            sa_address_postal_code: "",
            ch_references: "test"

          } as TrustCorporate,

          {

            id: "a3624116-6483-4023-ab7f-acd052af8484",

            type: RoleWithinTrustType.SETTLOR,

            name: "Kareem Cole",

            date_became_interested_person_day: "",

            date_became_interested_person_month: "",

            date_became_interested_person_year: "",

            ro_address_premises: "Tara Carney",

            ro_address_line_1: "611 Oak Court",

            ro_address_line_2: "Placeat voluptatem ",

            ro_address_locality: "Sint aute qui soluta",

            ro_address_region: "Ut maxime ex molesti",

            ro_address_country: "Slovakia",

            ro_address_postal_code: "17872",

            ro_address_care_of: "",

            ro_address_po_box: "",

            sa_address_care_of: "",

            sa_address_po_box: "",

            identification_legal_authority: "In provident assume",

            identification_legal_form: "Distinctio Aperiam ",

            is_service_address_same_as_principal_address: yesNoResponse.No,

            is_on_register_in_country_formed_in: 1,

            identification_place_registered: "Vincent Griffin",

            identification_country_registration: "Consequatur nostrum ",

            identification_registration_number: "559",

            sa_address_premises: "Herman Lloyd",

            sa_address_line_1: "491 Milton Boulevard",

            sa_address_line_2: "Est mollitia odit fu",

            sa_address_locality: "Dolore earum quis im",

            sa_address_region: "Veniam in Nam atque",

            sa_address_country: "New Caledonia",

            sa_address_postal_code: "21680",
            ch_references: "test"

          } as TrustCorporate,

          {

            id: "a8c4ae83-6416-4827-92a8-69804acbf2d7",

            type: RoleWithinTrustType.GRANTOR,

            name: "Luke Rodgers",

            date_became_interested_person_day: "",

            date_became_interested_person_month: "",

            date_became_interested_person_year: "",

            ro_address_premises: "Amber Munoz",

            ro_address_line_1: "12 West Rocky Old Drive",

            ro_address_line_2: "Quasi est iste eiusm",

            ro_address_locality: "Sunt commodo amet ",

            ro_address_region: "Autem delectus ut m",

            ro_address_country: "Palau",

            ro_address_postal_code: "22238",

            ro_address_care_of: "",

            ro_address_po_box: "",

            sa_address_care_of: "",

            sa_address_po_box: "",

            identification_legal_authority: "Provident modi labo",

            identification_legal_form: "Totam deleniti omnis",

            is_service_address_same_as_principal_address: yesNoResponse.Yes,

            is_on_register_in_country_formed_in: 0,

            sa_address_premises: "",

            sa_address_line_1: "",

            sa_address_line_2: "",

            sa_address_locality: "",

            sa_address_region: "",

            sa_address_country: "",

            sa_address_postal_code: "",
            ch_references: "test"

          } as TrustCorporate,

          {

            id: "ec206f77-c1fb-4800-aa16-41dc684bc6be",

            type: RoleWithinTrustType.INTERESTED_PERSON,

            name: "Reece Wilkins",

            date_became_interested_person_day: "12",

            date_became_interested_person_month: "2",

            date_became_interested_person_year: "2023",

            ro_address_premises: "Paul Henson",

            ro_address_line_1: "652 Rocky Milton Street",

            ro_address_line_2: "Sequi dolorem nihil ",

            ro_address_locality: "Qui tempora aut qui ",

            ro_address_region: "Occaecat ratione dol",

            ro_address_country: "Vatican City",

            ro_address_postal_code: "62938",

            ro_address_care_of: "",

            ro_address_po_box: "",

            sa_address_care_of: "",

            sa_address_po_box: "",

            identification_legal_authority: "Sapiente minim et om",

            identification_legal_form: "Qui nihil reiciendis",

            is_service_address_same_as_principal_address: yesNoResponse.No,

            is_on_register_in_country_formed_in: 0,

            sa_address_premises: "Jonas Ward",

            sa_address_line_1: "452 Oak Road",

            sa_address_line_2: "Praesentium sit arc",

            sa_address_locality: "Tempora iure consequ",

            sa_address_region: "Cupidatat aspernatur",

            sa_address_country: "Bulgaria",

            sa_address_postal_code: "29171",
            ch_references: "test"

          } as TrustCorporate],
        }];

      }
      setExtraData(req.session, appData);
      await updateOverseasEntity(req, session);
    }

    return res.redirect(config.OVERSEAS_ENTITY_PRESENTER_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
