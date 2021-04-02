const request = require('request')
const camelCase = require('camelcase')
const config = require('./config')

module.exports = class GraphAPi {
  static callSendAPI(requestBody) {
    // Send the HTTP request to the Messenger Platform
    request(
      {
        uri: `${config.mPlatform}/me/messages`,
        qs: {
          access_token: config.pageAccessToken,
        },
        method: 'POST',
        json: requestBody,
      },
      (error) => {
        if (error) {
          console.error('Unable to send message:', error)
        }
      }
    )
  }

  // static callMessengerProfileAPI(requestBody) {
  //   // Send the HTTP request to the Messenger Profile API

  //   console.log(`Setting Messenger Profile for app ${config.appId}`);
  //   request(
  //     {
  //       uri: `${config.mPlatfom}/me/messenger_profile`,
  //       qs: {
  //         access_token: config.pageAccesToken
  //       },
  //       method: "POST",
  //       json: requestBody
  //     },
  //     (error, _res, body) => {
  //       if (!error) {
  //         console.log("Request sent:", body);
  //       } else {
  //         console.error("Unable to send message:", error);
  //       }
  //     }
  //   );
  // }

  static callSubscriptionsAPI(customFields) {
    // Send the HTTP request to the Subscriptions Edge to configure your webhook
    // You can use the Graph API's /{app-id}/subscriptions edge to configure and
    // manage your app's Webhooks product
    // https://developers.facebook.com/docs/graph-api/webhooks/subscriptions-edge
    console.log(
      `Setting app ${config.appId} callback url to ${config.webhookUrl}`
    )

    let fields =
      'messages, messaging_postbacks, messaging_optins, \
        message_deliveries, messaging_referrals'

    if (customFields !== undefined) {
      fields = fields + ', ' + customFields
    }

    // console.log(fields);

    request(
      {
        uri: `${config.mPlatform}/${config.appId}/subscriptions`,
        qs: {
          access_token: config.appId + '|' + config.appSecret,
          object: 'page',
          callback_url: config.webhookUrl,
          verify_token: config.verifyToken,
          fields: fields,
          include_values: 'true',
        },
        method: 'POST',
      },
      (error, _res, body) => {
        if (!error) {
          console.log('Request sent:', body)
        } else {
          console.error('Unable to send message:', error)
        }
      }
    )
  }

  static callSubscribedApps(customFields) {
    // Send the HTTP request to subscribe an app for Webhooks for Pages
    // You can use the Graph API's /{page-id}/subscribed_apps edge to configure
    // and manage your pages subscriptions
    // https://developers.facebook.com/docs/graph-api/reference/page/subscribed_apps
    console.log(`Subscribing app ${config.appId} to page ${config.pageId}`)

    let fields =
      'messages, messaging_postbacks, messaging_optins, \
        message_deliveries, messaging_referrals'

    if (customFields !== undefined) {
      fields = fields + ', ' + customFields
    }

    // console.log(fields);

    request(
      {
        uri: `${config.mPlatform}/${config.pageId}/subscribed_apps`,
        qs: {
          access_token: config.pageAccessToken,
          subscribed_fields: fields,
        },
        method: 'POST',
      },
      (error, response, body) => {
        if (!error) {
          console.log('Request sent:', body)
        } else {
          console.error('Unable to send message:', error)
        }
      }
    )
  }

  static async getUserProfile(senderPsid) {
    try {
      const userProfile = await this.callUserProfileAPI(senderPsid)

      for (const key in userProfile) {
        const camelizedKey = camelCase(key)
        const value = userProfile[key]
        delete userProfile[key]
        userProfile[camelizedKey] = value
      }

      return userProfile
    } catch (err) {
      console.log('Fetch failed:', err)
    }
  }

  static callUserProfileAPI(senderPsid) {
    return new Promise(function (resolve, reject) {
      let body = []

      // Send the HTTP request to the Graph API
      request({
        uri: `${config.mPlatform}/${senderPsid}`,
        qs: {
          access_token: config.pageAccessToken,
          fields:
            'first_name, last_name, gender, locale, timezone, profile_pic',
        },
        method: 'GET',
      })
        .on('response', function (response) {
          // console.log(response.statusCode);

          if (response.statusCode !== 200) {
            reject(Error(response.statusCode))
          }
        })
        .on('data', function (chunk) {
          body.push(chunk)
        })
        .on('error', function (error) {
          console.error('Unable to fetch profile:' + error)
          reject(Error('Network Error'))
        })
        .on('end', () => {
          body = Buffer.concat(body).toString()
          // console.log(JSON.parse(body));

          resolve(JSON.parse(body))
        })
    })
  }

  static getPersonaAPI() {
    return new Promise(function (resolve, reject) {
      let body = []

      // Send the POST request to the Personas API
      console.log(`Fetching personas for app ${config.appId}`)

      request({
        uri: `${config.mPlatform}/me/personas`,
        qs: {
          access_token: config.pageAccessToken,
        },
        method: 'GET',
      })
        .on('response', function (response) {
          // console.log(response.statusCode);

          if (response.statusCode !== 200) {
            reject(Error(response.statusCode))
          }
        })
        .on('data', function (chunk) {
          body.push(chunk)
        })
        .on('error', function (error) {
          console.error('Unable to fetch personas:' + error)
          reject(Error('Network Error'))
        })
        .on('end', () => {
          body = Buffer.concat(body).toString()
          // console.log('getPersonaAPI', JSON.parse(body))

          resolve(JSON.parse(body).data)
        })
    })
  }

  static postPersonaAPI(name, profile_picture_url) {
    let body = []

    return new Promise(function (resolve, reject) {
      // Send the POST request to the Personas API
      console.log(`Creating a Persona for app ${config.appId}`)

      let requestBody = {
        name: name,
        profile_picture_url: profile_picture_url,
      }

      request({
        uri: `${config.mPlatform}/me/personas`,
        qs: {
          access_token: config.pageAccessToken,
        },
        method: 'POST',
        json: requestBody,
      })
        .on('response', function (response) {
          // console.log(response.statusCode);
          if (response.statusCode !== 200) {
            reject(Error(response.statusCode))
          }
        })
        .on('data', function (chunk) {
          body.push(chunk)
        })
        .on('error', function (error) {
          console.error('Unable to create a persona:', error)
          reject(Error('Network Error'))
        })
        .on('end', () => {
          body = Buffer.concat(body).toString()
          console.log('postPersonaAPI', JSON.parse(body))

          resolve(JSON.parse(body).id)
        })
    }).catch((error) => {
      console.error('Unable to create a persona:', error, body)
    })
  }
}
