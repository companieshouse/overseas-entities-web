import { FEATURE_FLAG_ENABLE_CHANGE_LINKS_02082022 } from "../config";
import { isActiveFeature } from "./feature.flag";

export const createChangeLinkConfig = (href: string, text: string, dataEventId: string) => {
  return (isActiveFeature(FEATURE_FLAG_ENABLE_CHANGE_LINKS_02082022)) ? {
    href,
    text: 'Change',
    attributes: {
      'data-event-id': dataEventId
    },
    visuallyHiddenText: text
  } : "";
};
