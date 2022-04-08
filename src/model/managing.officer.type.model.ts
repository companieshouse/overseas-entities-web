import { ManagingOfficerTypeChoice } from "./data.types.model";

/*
  The ManagingOfficerTypeType fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const ManagingOfficerTypeKey = "managingOfficerType";
export const ManagingOfficerTypeKeys: string[] = [ "managingOfficerType" ];


export interface ManagingOfficerType {
  managingOfficerType?: ManagingOfficerTypeChoice [];
}
