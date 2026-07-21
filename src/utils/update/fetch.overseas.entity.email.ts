import { logger } from "../logger";
import { Session } from "@companieshouse/node-session-handler";
import { setExtraData } from "../application.data";
import { ApplicationData } from "../../model";
import { getPrivateOeDetails } from "../../service/private.overseas.entity.details";
import { updateOverseasEntity } from "../../service/overseas.entities.service";

export const fetchOverseasEntityEmailAddress = async (appData: ApplicationData, req, session: Session) => {

  const overseasEntityId = appData.overseas_entity_id;
  const transactionId = appData.transaction_id;
  if (appData.entity === undefined) {
    appData.entity = {};
  }
  if (!appData.entity.email && overseasEntityId !== undefined && transactionId !== undefined) {
    try {
      const privateOeDetails = await getPrivateOeDetails(req, transactionId, overseasEntityId);
      if (!privateOeDetails?.email_address?.length) {
        const message = `Private OE Details not found for overseas entity ${appData.entity_number}`;
        logger.infoRequest(req, message);
      } else {
        logger.info(`Private OE Details fetched for overseas entity ${appData.entity_number}`);
        appData.entity.email = privateOeDetails.email_address;
        // Cache in session and save out for save&resume.
        setExtraData(session, appData);
        await updateOverseasEntity(req, session, appData);
      }
    } catch (error) {
      const message = `Private OE Details could not be retrieved for overseas entity ${appData.entity_number}`;
      logger.errorRequest(req, message);
    }
  }
};
