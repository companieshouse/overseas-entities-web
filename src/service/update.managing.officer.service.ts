import { ApplicationData } from "../model";
import { RadioType } from "../model/radio.type";
import { yesNoResponse } from "../model/data.types.model";

interface ManagingOfficerFields {
  title: String,
  radioItems: RadioType[]
}

const getRadioBOTypes = (): Array<RadioType> => {
  return [{
    value: "individualOwner",
    text: "Individual beneficial owner"
  },
  {
    value: "otherLegalOwner",
    text: "Other legal entity beneficial owner"
  },
  {
    value: "governmentOrPublicOwner",
    text: "Government or public authority beneficial owner"
  },
  {
    value: "individualOfficer",
    text: "Individual managing officer"
  },
  {
    value: "corporateOfficer",
    text: "Corporate managing officer"
  }];
};

export const generateManagerOfficerFields = (appData: ApplicationData): ManagingOfficerFields => {
  const managingOfficerFields = {} as ManagingOfficerFields;
  managingOfficerFields.radioItems = [...new Set(getRadioBOTypes().map(v => v))];
  if (appData.managing_officers_individual?.some(o => o.is_still_managing_OE === yesNoResponse.Yes)) {
    managingOfficerFields.title = "This is new Dummy Heading";
    managingOfficerFields.radioItems.push({ value: "DummyRadio", text: "This is another dummy radio" });
  }
  console.log("manager officer individual: ", appData.managing_officers_individual);
  console.log("radio buttons: ", managingOfficerFields.radioItems);
  return managingOfficerFields;
};
