const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


const app = require("../../app");
const db = require("../../db");
const { SECRET_KEY } = require("../../config");

let TESTDATA = {};

async function beforeEachHook() {
  try {
    // login a user, get a token, store the user ID and token
    const hashedPassword = await bcrypt.hash('pw1', 1);
    await db.query(
      `INSERT INTO users (username, password, first_name, last_name, email, is_admin)
                  VALUES ('johndoe', $1, 'John', 'Doe', 'johndoe@email.com', true)`,
      [hashedPassword]
    );

    const response = await request(app)
      .post('/login')
      .send({
        username: 'johndoe',
        password: 'pw1'
      });
    TESTDATA.userToken = response.body.token;
    TESTDATA.currentUsername = jwt.decode(TESTDATA.userToken).username;


    const company = await db.query(
      `INSERT INTO companies (handle, name, num_employees, description, logo_url)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      ['CW', 'Costco Wholesale Inc.', 1000, 'Warehouse Retailer', 'www.logo.com/cc' ]
    );
    TESTDATA.currentCompany = company.rows[0];

    const job = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
        VALUES ('Software Eng', 120000, 0.50, $1) RETURNING *`,
        [TESTDATA.currentCompany.handle]
    );
    TESTDATA.currentJobId = job.rows[0].id;

  } catch (error) {
    console.error(error);
  }
}


async function afterEachHook() {
  await db.query(`DELETE FROM users`);
  await db.query('DELETE FROM jobs');
  await db.query('DELETE FROM companies')
}

async function afterAllHook() {
  try {
    await db.end()
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  TESTDATA,
  beforeEachHook,
  afterAllHook,
  afterEachHook
};