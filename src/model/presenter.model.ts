export const PresenterKey = "presenter";
/*
  The Presenter fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const PresenterKeys: string[] = ["full_name", "email"];
export interface Presenter {
    full_name?: string
    email?: string
}
