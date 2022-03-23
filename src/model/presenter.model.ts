
enum presenterRole {
    administrator,
    agent,
    solicitor,
    beneficialOwner,
    other
  }
export interface Presenter {
    fullName: string
    phoneNumber: string
    role: presenterRole
    roleTitle?: string
    registrationNumber: number
}
