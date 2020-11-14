const express = require("express");
const router = express.Router();
const jsonschema = require("jsonschema");

const isEmpty = require("../helpers/miscellaneous")
// Validation schema

// POST (aka add)
const addJobSchema = require("../schemas/addJobSchema.json");
const updateJobSchema = require("../schemas/updateJobSchema.json") 

const ExpressError = require("../helpers/expressError")
const Job = require("../models/jobs");
const { SECRET_KEY } = require("../config");
const { json } = require("express");


// POST /users
// This should create a new user and return information on the newly created user.

// This should return JSON: {user: user}

// GET /users
// This should return the username, first_name, last_name and email of the user objects.

// This should return JSON: {users: [{username, first_name, last_name, email}, ...]}

// GET /users/[username]
// This should return all the fields for a user excluding the password.

// This should return JSON: {user: {username, first_name, last_name, email, photo_url}}

// PATCH /users/[username]
// This should update an existing user and return the updated user excluding the password.

// This should return JSON: {user: {username, first_name, last_name, email, photo_url}}

// DELETE /users/[username]
// This should remove an existing user and return a message.

// This should return JSON: { message: "User deleted" }