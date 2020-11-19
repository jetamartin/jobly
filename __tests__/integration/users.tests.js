process.env.NODE_ENV = "test"
const request = require("supertest");
const { get } = require("../../app");


const app = require("../../app");
const db = require("../../db");

let usernameVal;

beforeEach(async () => {
  try {
 
    let userResults = await db.query(`
    INSERT INTO
      users (username, password, first_name, last_name, email, photo_url, is_admin)
      VALUES(
        'johndoe',
        'pwd1',
        'John',
        'Doe',
        'jdoe@email.com',
        'www.photos.com/johndoe',
        false
      )
      RETURNING username, password, first_name, last_name, email, photo_url, is_admin
    `);
  
    usernameVal = userResults.rows[0].username;
  } catch (error) {
    return error;
  }

});

afterEach(async function () {
  await db.query(`DELETE FROM users`);
});


afterAll(async function () {
  await db.end()
});

// GET  - Retrieve all users
describe('GET /users', () => {
  test("Retrieve all users", async () => {
    const results = await request(app)
    .get('/users')
    expect(results.statusCode).toBe(200);
    expect(results.body.users[0].username).toEqual("johndoe");
  })
})
// POST - Add a user
describe('POST /users', () => {
  test("Add a user", async () => {
    // debugger;
    const results = await request(app)
    .post('/users')
    .send({
      username: 'janedoe',
      password: 'pwd1',
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'janedoe@email.com',
      photo_url: 'www.photos.com/janedoe',
      is_admin: false
    });
    // debugger;
    expect(results.statusCode).toBe(201);
    expect(results.body.user.username).toEqual("janedoe");
  })
})


// GET - Retrieve a specific user by username
describe('GET /users/:username', () => {
  test("Retrieve a user by username", async () => {
    const results = await request(app)
    .get(`/users/${usernameVal}`)
    expect(results.statusCode).toBe(200);
    expect(results.body.user.username).toEqual("johndoe");
  })
})

// PATCH - Update a user 
describe('PATCH /users/:username', () => {
  test("Update a field of an existing user", async () => {
    const results = await request(app)
    .patch(`/users/${usernameVal}`)
    .send({
      username: 'johndoe',
      password: 'pwd1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'jdoe@email.com',
      photo_url: 'www.photos.com/johndoe',
      is_admin: true
    });
    expect(results.statusCode).toBe(200);
    expect(results.body.user.is_admin).toBeTruthy();
  })
})

// // DElETE - Remove a user from the database

describe('DELETE /users/:username', () => {
  test("Delete a user", async () => {
    // debugger;
    const results = await request(app)
    .delete(`/users/${usernameVal}`)
    expect(results.statusCode).toBe(200);
    expect(results.body.message).toEqual('User Deleted')
  })
})
