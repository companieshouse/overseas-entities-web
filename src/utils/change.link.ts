import { FEATURE_FLAG_ENABLE_CHANGE_LINKS_02082022 } from "../config";
import { isActiveFeature } from "./feature.flag";

export const createChangeLinkConfig = (href: string, text: string) => {
  return (isActiveFeature(FEATURE_FLAG_ENABLE_CHANGE_LINKS_02082022)) ? {
    href,
    text: 'Change',
    visuallyHiddenText: text
  } : "";
};
