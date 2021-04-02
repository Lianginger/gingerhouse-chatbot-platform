module.exports = class User {
  constructor(psid) {
    this.psid = psid
    this.firstName = ''
    this.lastName = ''
    this.locale = ''
    this.timezone = ''
    this.profilePic = ''
    this.gender = 'neutral'
  }
  setProfile(profile) {
    this.firstName = profile.firstName
    this.lastName = profile.lastName
    this.locale = profile.locale
    this.timezone = profile.timezone
    this.profilePic = profile.profilePic
    if (profile.gender) {
      this.gender = profile.gender
    }
  }
}
