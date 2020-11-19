const express = require("express");
const router = express.Router();
const jsonschema = require("jsonschema");

const isEmpty = require("../helpers/miscellaneous")
// Validation schema

const userSchema = require("../schemas/userSchema.json");

const ExpressError = require("../helpers/expressError")
const User = require("../models/users");
const { ensureCorrectUser, authRequired } = require('../middleware/auth');
const createToken = require("../helpers/createToken");



/**
 * POST /users
 * Creates a new user and return information on the newly created user.
 * This will return JSON: {user: user}
 */
router.post('/', async (req, res, next) => {
  try {
    // debugger;
    const validateJson = jsonschema.validate(req.body, userSchema);
    if (!validateJson.valid) {
      //pass validation errors to error handler
      let listOfErrors = validateJson.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error)
    }
    if (isEmpty(req.body)) {
      throw new ExpressError('Required info to create a new company is missing', 400);
    }
    const user = await User.register(req.body);
    const token = createToken(user);
    // debugger;
    return res.status(201).json({token});
  } catch (error) {
    return next(error)
  }
})

/**
 * GET /users
 * This should return the username, first_name, last_name and email of the user objects
 * This should return JSON: {users: [{username, first_name, last_name, email}, ...]}
 */
router.get('/', authRequired, async (req, res, next) => {
  try {
    const users = await User.getAll();
    return res.json({users})

  } catch (error) {
    return next(error)
  }
});
 

 /**
  * GET /users/[username]
  * This should return all the fields for a user excluding the password.
  * This should return JSON: {user: {username, first_name, last_name, email, photo_url}}
*/
router.get('/:username', authRequired, async (req, res, next) => {
  try {
    const username = req.params.username;
    // debugger;
    const user = await User.getUser(username);
    // debugger;
    return res.json({user})
  } catch (error) {
    return next(error)
  }
});

/**
 * PATCH /users/[username]
 * This should update an existing user and return the updated user excluding the password
 * This should return JSON: {user: {username, first_name, last_name, email, photo_url}}
 */
router.patch('/:username', ensureCorrectUser, async (req, res, next) => {
  try {
    debugger
    const username = req.params.username;
    const validateJson = jsonschema.validate(req.body, userSchema);
    if (!validateJson.valid) {
      //pass validation errors to error handler
      let listOfErrors = validateJson.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error)
    }
    if (isEmpty(req.body)) {
      throw new ExpressError('Required info to update a user is missing', 400);
    } else {
      const user = await User.update(username, req.body);
      // debugger;
      return res.json({user});
    }
    
  } catch (error) {
    
  }
});

 /**
  * DELETE /users/[username]
  * This should remove an existing user and return a message.
  * This should return JSON: { message: "User deleted" }
*/
router.delete('/:username', ensureCorrectUser, async (req, res, next) => {
  try {
    const username = req.params.username; 
    const user = await User.remove(username);
    return res.json({message: 'User Deleted'})
    
  } catch (error) {
    return next(error)
  }
});

module.exports = router; 