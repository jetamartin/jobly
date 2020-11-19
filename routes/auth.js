const express = require("express");
const router = new express.Router();
const User = require("../models/users"); 
const createToken = require("../helpers/createToken")

/**
 * POST /login
 * Authenticates a user and return a JSON Web Token which contains
 *  a payload with the username and is_admin values.
 * Returns JSON: {token: token}
 */
router.post('/login', async (req, res, next) => {
  try {
    const user = await User.authenticate(req.body)
    const token = createToken(user)
    return res.json({ token })
  } catch (error) {
    return next(error)
  }
})

module.exports = router;