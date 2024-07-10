import { logger } from "../logger";
import { getManagingOfficersPrivateData } from "../../service/private.overseas.entity.details";
import { ApplicationData } from "../../model";
import { mapIndividualMoPrivateData, mapCorporateMoPrivateData } from "./managing.officer.mapper";

export const fetchManagingOfficersPrivateData = async (appData: ApplicationData, req) => {

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
        mapManagingOfficersPrivateData(moPrivateData, appData);
        // Note: saved to persistent session when appData.entity.email is fetched.
      }
    } catch (error) {
      logger.errorRequest(req, `Private Managing Officer details could not be retrieved for overseas entity ${appData.entity_number}`);
    }
  }
};

const mapManagingOfficersPrivateData = (moPrivateData, appData: ApplicationData) => {
  appData.update?.review_managing_officers_individual?.forEach(managingOfficer => {
    if (managingOfficer.ch_reference) {
      mapIndividualMoPrivateData(moPrivateData, managingOfficer);
    }
  });
  appData.update?.review_managing_officers_corporate?.forEach(managingOfficer => {
    if (managingOfficer.ch_reference) {
      mapCorporateMoPrivateData(moPrivateData, managingOfficer);
    }
  });
};
