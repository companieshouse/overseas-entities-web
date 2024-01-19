export const RemoveKey = "remove";

export interface Remove {
  is_listed_as_property_owner?: string; // '1' for yes '0' for no
  has_sold_all_land?: string; // '1' for yes '0' for no
  is_not_proprietor_of_land?: boolean;
}
