const GraphAPi = require('../services/graph-api')

const db = require('../db/db')
const { referral } = require('../db/db')

module.exports = class Receive {
  constructor(user, webhookEvent) {
    this.user = user
    this.webhookEvent = webhookEvent
  }

  // Check if the event is a message or postback and
  // call the appropriate handler function
  handleMessage() {
    let event = this.webhookEvent

    let responses

    try {
      if (event.message) {
        let message = event.message

        if (message.quick_reply) {
          // responses = this.handleQuickReply()
        } else if (message.attachments) {
          // responses = this.handleAttachmentMessage()
        } else if (message.text) {
          responses = this.handleTextMessage()
        }
      } else if (event.postback) {
        // responses = this.handlePostback()
      } else if (event.referral) {
        responses = this.handleReferral()
      }
    } catch (error) {
      console.error(error)
      responses = {
        text: `An error has occured: '${error}'. We have been notified and \
        will fix the issue shortly!`,
      }
    }

    if (Array.isArray(responses)) {
      let delay = 0
      for (let response of responses) {
        this.sendMessage(response, delay * 2000)
        delay++
      }
    } else {
      this.sendMessage(responses)
    }
  }

  // Handles messages events with text
  handleTextMessage() {
    let message = this.webhookEvent.message.text
    let response

    console.log('Received text:', `${message} for ${this.user.lastName}`)

    response = {
      text: '收到你的來信~',
    }

    return response
  }

  // // Handles mesage events with attachments
  // handleAttachmentMessage() {
  //   let response;

  //   // Get the attachment
  //   let attachment = this.webhookEvent.message.attachments[0];
  //   console.log("Received attachment:", `${attachment} for ${this.user.psid}`);

  //   response = Response.genQuickReply(i18n.__("fallback.attachment"), [
  //     {
  //       title: i18n.__("menu.help"),
  //       payload: "CARE_HELP"
  //     },
  //     {
  //       title: i18n.__("menu.start_over"),
  //       payload: "GET_STARTED"
  //     }
  //   ]);

  //   return response;
  // }

  // // Handles mesage events with quick replies
  // handleQuickReply() {
  //   // Get the payload of the quick reply
  //   let payload = this.webhookEvent.message.quick_reply.payload;

  //   return this.handlePayload(payload);
  // }

  // // Handles postbacks events
  // handlePostback() {
  //   let postback = this.webhookEvent.postback;
  //   // Check for the special Get Starded with referral
  //   let payload;
  //   if (postback.referral && postback.referral.type == "OPEN_THREAD") {
  //     payload = postback.referral.ref;
  //   } else {
  //     // Get the payload of the postback
  //     payload = postback.payload;
  //   }
  //   return this.handlePayload(payload.toUpperCase());
  // }

  // Handles referral events
  handleReferral() {
    // Get the payload of the postback
    let payload = this.webhookEvent.referral.ref.toUpperCase()

    return this.handlePayload(payload)
  }

  handlePayload(payload) {
    let response
    console.log('Received Payload:', `${payload} for ${this.user.lastName}`)

    let isPayloadInDB = false
    let responseText = ''
    db.referral.forEach((referral) => {
      if (referral.ref.toUpperCase() === payload) {
        isPayloadInDB = true
        responseText = referral.text
      }
    })
    // Set the response based on the payload
    if (isPayloadInDB) {
      response = {
        text: responseText,
      }
    } else if (payload === 'SURVEY_THANK_YOU_PAGE') {
      response = {
        text: `感謝您填寫問卷，上線通知您`,
      }
    } else {
      response = {
        text: `This is a default postback message for payload: ${payload}!`,
      }
    }

    return response
  }

  handlePrivateReply(type, object_id) {
    let response = {
      text: '留言轉貼文回覆',
    }

    let requestBody = {
      recipient: {
        [type]: object_id,
      },
      message: response,
    }

    GraphAPi.callSendAPI(requestBody)
  }

  sendMessage(response, delay = 0) {
    // Check if there is delay in the response
    if ('delay' in response) {
      delay = response['delay']
      delete response['delay']
    }

    // Construct the message body
    let requestBody = {
      recipient: {
        id: this.user.psid,
      },
      message: response,
      persona_id: '400015477379576',
    }

    // Check if there is persona id in the response
    if ('persona_id' in response) {
      let persona_id = response['persona_id']
      delete response['persona_id']

      requestBody = {
        recipient: {
          id: this.user.psid,
        },
        message: response,
        persona_id: persona_id,
      }
    }

    setTimeout(() => GraphAPi.callSendAPI(requestBody), delay)
  }

  // firstEntity(nlp, name) {
  //   return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
  // }
}
