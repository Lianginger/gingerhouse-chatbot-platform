const express = require('express')
const router = express.Router()

const GraphAPi = require('../services/graph-api')

const db = require('../db/db')
const { referral } = require('../db/db')

router.get('/page-personas', async function (req, res, next) {
  const personas = await GraphAPi.getPersonaAPI()
  res.json(personas)
})

router.get('/db', (req, res) => {
  res.json(db)
})

router.post('/referral', (req, res) => {
  const body = req.body
  console.log(body)
  db.referral.push(body)
  res.redirect('/')
})

router.delete('/referral', (req, res) => {
  const body = req.body
  const index = db.referral.findIndex((referral) => referral.ref === body.ref)
  if (index > -1) {
    db.referral.splice(index, 1)
  }

  res.json({
    status: 'ok',
  })
})

module.exports = router
