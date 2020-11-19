/** User class for jobly */

const db = require("../db");
const ExpressError = require("../helpers/expressError");

const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config"); 


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
   * 
   * @param {*} userInfo 
   */
  static async register(userInfo) {
    try {
      // Check to make user not a duplicate user
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

      const hashedPassword = await bcrypt.hash(userInfo.password, BCRYPT_WORK_FACTOR);
      // debugger;
      const {username, password, first_name, last_name, email, photo_url, is_admin } = userInfo;
      const newUser = await db.query(
        `INSERT INTO users
          (username, password, first_name, last_name, email, photo_url, is_admin)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING username, password, first_name, last_name, email, photo_url, is_admin`,
          [ username, hashedPassword, first_name, last_name, email, photo_url, is_admin ]
      );
      return newUser.rows[0];

    } catch (error) {
      return error
    }
  }

  /**
   * 
   */
  static async getAll() {
    try {
      const userResults = await db.query(
        `SELECT username, first_name, last_name, email
        FROM users `
      );
      return userResults.rows;
    } catch (error) {
      return error
    }
  }


/**
 * 
 * @param {*} username 
 */
  static async getUser(username) {
    try {
      const userResults = await db.query(
        `SELECT username, first_name, last_name, email, photo_url
          FROM users
          WHERE username = $1`,
          [username]
      );

      if (userResults.rows.length === 0) {
        throw { message: `There is no user with the username of '${username}' `, status: 404 }
      }
      // debugger;
      return userResults.rows[0];

    } catch (error) {
      return error;
    }
  }

  /**
   * 
   * @param {*} username 
   * @param {*} data 
   */
  static async update(username, data) {
    try {
      const { password, first_name, last_name, email, photo_url, is_admin} = data;
      const userResults = await db.query(
        `UPDATE users SET
          password = ($1),
          first_name = ($2),
          last_name = ($3),
          email = ($4),
          photo_url = ($5),
          is_admin = ($6)
         WHERE username = $7
         RETURNING username, first_name, last_name, email, photo_url`, 
         [password, first_name, last_name, email, photo_url, is_admin, username] 
      );
     

      if (userResults.rows.length === 0) {
        throw { message: `There is no user with a username of '${username}' `, status: 404 }
      }
      
      return userResults.rows[0];

    } catch (error) {
      return error;
    }
  }

  /**
   * 
   * @param {*} username 
   */
  static async remove(username) {
    try {
      // debugger;
      const result = await db.query(
        `DELETE FROM users
          WHERE username = $1
          RETURNING username`,
          [username]
      );
      // debugger;
      if (result.rows.length === 0) {
        throw { message: `There is no user with a username of '${username}`, status: 404 }
      }
      return resuts.rows[0]
      
    } catch (error) {
      return error
    }
  }
}



module.exports = User;
