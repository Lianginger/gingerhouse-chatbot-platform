const request = require('request')
const express = require('express')
const router = express.Router()

const User = require('../services/user')
const GraphAPi = require('../services/graph-api')
const Receive = require('../services/receive')

const users = {}

GraphAPi.callSubscriptionsAPI()
GraphAPi.callSubscribedApps()

/* GET home page. */
router.get('/', async function (req, res, next) {
  res.render('index', { title: 'Express' })
})

// Adds support for GET requests to our webhook
router.get('/webhook', (req, res) => {
  // Your verify token. Should be a random string.
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN

  // Parse the query params
  let mode = req.query['hub.mode']
  let token = req.query['hub.verify_token']
  let challenge = req.query['hub.challenge']
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED')
      res.status(200).send(challenge)
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403)
    }
  }
})

// Creates the endpoint for your webhook
router.post('/webhook', (req, res) => {
  let body = req.body

  // Checks if this is an event from a page subscription
  if (body.object === 'page') {
    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED')

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      console.log('=== entry start ===')
      console.log(entry)
      console.log('=== entry end ===')

      if ('changes' in entry) {
        // Handle Page Changes event
        let receiveMessage = new Receive()
        if (entry.changes[0].field === 'feed') {
          let change = entry.changes[0].value
          switch (change.item) {
            case 'post':
              return receiveMessage.handlePrivateReply(
                'post_id',
                change.post_id
              )
            case 'comment':
              return receiveMessage.handlePrivateReply(
                'comment_id',
                change.comment_id
              )
            default:
              console.log('Unsupported feed change type.')
              return
          }
        }
      }

      // Gets the body of the webhook event
      let webhookEvent = entry.messaging[0]
      // console.log(webhookEvent)

      // Get the sender PSID
      let senderPsid = webhookEvent.sender.id

      if (!(senderPsid in users)) {
        let user = new User(senderPsid)

        GraphAPi.getUserProfile(senderPsid)
          .then((userProfile) => {
            user.setProfile(userProfile)
          })
          .catch((error) => {
            // The profile is unavailable
            console.log('Profile is unavailable:', error)
          })
          .finally(() => {
            users[senderPsid] = user
            console.log('New Profile PSID:', senderPsid)
            let receiveMessage = new Receive(users[senderPsid], webhookEvent)
            return receiveMessage.handleMessage()
          })
      } else {
        console.log('Profile already exists PSID:', senderPsid)
        let receiveMessage = new Receive(users[senderPsid], webhookEvent)
        return receiveMessage.handleMessage()
      }
    })
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404)
  }
})

module.exports = router
