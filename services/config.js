require('dotenv').config()

module.exports = {
  // Messenger Platform API
  mPlatformDomain: 'https://graph.facebook.com',
  mPlatformVersion: 'v10.0',

  // Page and Application information
  pageId: process.env.PAGE_ID,
  pageAccessToken: process.env.PAGE_ACCESS_TOKEN,
  appId: process.env.APP_ID,
  appSecret: process.env.APP_SECRET,
  verifyToken: process.env.VERIFY_TOKEN,

  // URL of your app domain
  appUrl: process.env.APP_URL,

  // URL of your website
  shopUrl: process.env.SHOP_URL,

  // Persona IDs
  personas: {},

  // Preferred port (default to 3000)
  port: process.env.PORT || 3000,

  get mPlatform() {
    return this.mPlatformDomain + '/' + this.mPlatformVersion
  },

  // URL of your webhook endpoint
  get webhookUrl() {
    return this.appUrl + '/webhook'
  },
}
