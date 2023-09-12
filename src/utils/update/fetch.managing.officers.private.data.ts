import * as config from "../../config";
import { logger } from "../logger";
import { getManagingOfficersPrivateData } from "../../service/private.overseas.entity.details";
import { isActiveFeature } from '../feature.flag';
import { ApplicationData } from "../../model";
import { mapMoPrivateAddress } from "./managing.officer.mapper";

export const fetchManagingOfficersPrivateData = async (appData: ApplicationData, req) => {

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
      const moPrivateData = await getManagingOfficersPrivateData(req, transactionId, overseasEntityId);
      if (!moPrivateData || moPrivateData.length === 0) {
        logger.info(`No private Managing Officer details were retrieved for overseas entity ${appData.entity_number}`);
      } else {
        mapManaginOfficersPrivateData(moPrivateData, appData);
        // Note: saved to persistent session when appData.entity.email is fetched.
      }
    } catch (error) {
      logger.errorRequest(req, `Private Managing Officer details could not be retrieved for overseas entity ${appData.entity_number}`);
    }
  }
};

const mapManaginOfficersPrivateData = (moPrivateData, appData: ApplicationData) => {
  if (moPrivateData !== undefined && moPrivateData.length > 0) {
    appData.update?.review_managing_officers_individual?.forEach(managingOfficer => {
      if (managingOfficer.ch_reference) {
        managingOfficer.usual_residential_address = mapMoPrivateAddress(moPrivateData, managingOfficer.ch_reference, false);
      }
    });
    appData.update?.review_managing_officers_corporate?.forEach(managingOfficer => {
      if (managingOfficer.ch_reference) {
        managingOfficer.principal_address = mapMoPrivateAddress(moPrivateData, managingOfficer.ch_reference, true);
      }
    });
  }
};
