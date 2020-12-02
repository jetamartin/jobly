/** User class for jobly */

const db = require("../db");
const ExpressError = require("../helpers/expressError");

const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const partialUpdate = require("../helpers/partialUpdate")


class User {
  /**
   * 
   * @param {*} userInfo 
   */
  static async authenticate(userInfo) {
    const result = await db.query(
      `SELECT username,
              password,
              first_name,
              last_name,
              email, 
              photo_url,
              is_admin
        FROM users
        WHERE username = $1`, 
        [userInfo.username]
    );
    const user = result.rows[0];
    if (user) {
      const isValid = await bcrypt.compare(userInfo.password, user.password);
      if (isValid) {
        return user;
      }
    }
    throw new ExpressError("Invalid Password", 401); 
  }

  /**
   * Register a user and return
   * @param {*} userInfo - all user info needed to create a new user entry
   */
  static async register(userInfo) {
    // Check to make user this is not a duplicate of existing user
    const result = await db.query(
      `SELECT username
        FROM users
        WHERE username = $1`,
        [userInfo.username]
    );

    if (result.rows[0]) {
      throw new ExpressError(
        `There is already a user with the username '${userInfo.username}`, 400);
    }
    // hash the password
    const hashedPassword = await bcrypt.hash(userInfo.password, BCRYPT_WORK_FACTOR);
    const {username, password, first_name, last_name, email, photo_url, is_admin } = userInfo;
    const newUser = await db.query(
      `INSERT INTO users
        (username, password, first_name, last_name, email, photo_url, is_admin)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING username, password, first_name, last_name, email, photo_url, is_admin`,
        [ username, hashedPassword, first_name, last_name, email, photo_url, is_admin ]
    );
    return newUser.rows[0];
  }

  /**
   * Retrieve all users
   */
  static async getAll() {
     const userResults = await db.query(
      `SELECT username, first_name, last_name, email
      FROM users `
    );
    return userResults.rows;
  }


/**
 * Retrieve a user by username
 * @param {*} username 
 */
  static async getUser(username) {
    const userResults = await db.query(
      `SELECT username, first_name, last_name, email, photo_url
        FROM users
        WHERE username = $1`,
        [username]
    );

    if (userResults.rows.length === 0) {
      throw { message: `There is no user with the username of '${username}' `, status: 404 }
    }
    return userResults.rows[0];
  }

  /**
   * Update a user record
   * @param {*} username 
   * @param {*} data - values to be updated
   */
  static async update(username, data) {
    const { password, first_name, last_name, email, photo_url, is_admin} = data;
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR); 
    }

    let { query, values } = partialUpdate("users", data, "username", username);
    const result = await db.query(query, values);
    const user = result.rows[0]; 
    if (!user) {
      throw { message: `There is no user with a username of '${username}' `, status: 404 }
    }
    delete user.password;
    delete user.is_admin;
    return result.rows[0];
  }

  /**
   * Delete a user by username
   * @param {*} username 
   */
  static async remove(username) {
    const result = await db.query(
      `DELETE FROM users
        WHERE username = $1
        RETURNING username`,
        [username]
    );
    if (result.rows.length === 0) {
      throw { message: `There is no user with a username of '${username}`, status: 404 }
    }
    return result.rows[0]
  }
}

module.exports = User;
