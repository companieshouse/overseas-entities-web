import * as config from "../../config";
import { logger } from "../logger";
import { getBeneficialOwnersPrivateData } from "../../service/private.overseas.entity.details";
import { isActiveFeature } from '../feature.flag';
import { ApplicationData } from "../../model";
import { mapCorporateOrGovernmentBOPrivateData, mapIndividualBOPrivateData } from "./psc.to.beneficial.owner.type.mapper";

export const fetchBeneficialOwnersPrivateData = async (appData: ApplicationData, req) => {

  if (isActiveFeature(config.FEATURE_FLAG_DISABLE_UPDATE_PRIVATE_DATA_FETCH)) {
    return;
  }

  const overseasEntityId = appData.overseas_entity_id;
  const transactionId = appData.transaction_id;
  if (appData.entity === undefined) {
    appData.entity = {};
  }
  if (!appData.entity.email && overseasEntityId !== undefined && transactionId !== undefined) {
    try {
      const boPrivateData = await getBeneficialOwnersPrivateData(req, transactionId, overseasEntityId);
      if (!boPrivateData || boPrivateData.length === 0) {
        logger.info(`No private Beneficial Owner details were retrieved for overseas entity ${appData.entity_number}`);
      } else {
        mapBeneficialOwnersPrivateData(boPrivateData, appData);
      }
    } catch (error) {
      logger.errorRequest(req, `Private Beneficial Owner details could not be retrieved for overseas entity ${appData.entity_number}`);
    }
  }
};

const mapBeneficialOwnersPrivateData = (boPrivateData, appData: ApplicationData) => {
  if (boPrivateData !== undefined && boPrivateData.length > 0) {
    appData.update?.review_beneficial_owners_individual?.forEach(beneficialOwner => {
      if (beneficialOwner.ch_reference) {
        mapIndividualBOPrivateData(boPrivateData, beneficialOwner);
      }
    });
    appData.update?.review_beneficial_owners_corporate?.forEach(beneficialOwner => {
      if (beneficialOwner.ch_reference) {
        mapCorporateOrGovernmentBOPrivateData(boPrivateData, beneficialOwner);
      }
    });
    appData.update?.review_beneficial_owners_government_or_public_authority?.forEach(beneficialOwner => {
      if (beneficialOwner.ch_reference) {
        mapCorporateOrGovernmentBOPrivateData(boPrivateData, beneficialOwner);
      }
    });
  }
};
