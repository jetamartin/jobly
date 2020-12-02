process.env.NODE_ENV = "test"
const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");



const app = require("../../app");
const db = require("../../db");
const { SECRET_KEY } = require("../../config");

const {TESTDATA, beforeEachHook, afterEachHook, afterAllHook} = require('./config');

beforeEach(async () => {
  await beforeEachHook(TESTDATA);
});

afterEach(async function () {
  await afterEachHook();
});

afterAll(async function () {
  await afterAllHook();
});

// GET  - Retrieve all users - Single user in this case
describe('GET /users', () => {
  jest.setTimeout(3 * 60 * 1000)
  try {
    test("Retrieve all users", async () => {
      const userResults = await request(app)
        .get('/users')
        .send({
          "_token": TESTDATA.userToken
        });
      expect(userResults.statusCode).toBe(200);
      expect(userResults.body.users[0].username).toEqual("johndoe");
    })
  } catch (error) {
    return error
  }

})
// POST - Add a user
describe('POST /users', () => {
  test("Add a user", async () => {
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
  
    expect(results.statusCode).toBe(201);
    const returnedToken = results.body.token;
    const token = jwt.verify(returnedToken, SECRET_KEY);
    expect(token.username).toEqual("janedoe");
  })
  test("Prevents add a duplicate user", async () => {
    const results = await request(app)
    .post('/users')
    .send({
      username: 'johndoe',
      password: 'pwd1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'johndoe@email.com',
      photo_url: 'www.photos.com/johndoe',
      is_admin: false
    });
  
    expect(results.statusCode).toBe(400);
  })
  test('Prevents creating a user without required password field', async () => {
    const results = await request(app)
    .post('/users')
    .send({
      username: 'frankdoe',
      first_name: 'Frank',
      last_name: 'Doe',
      email: 'frankdoe@email.com',
      photo_url: 'www.photos.com/frankdoe',
      is_admin: false
    });
     expect(results.statusCode).toBe(400);
  })
})


// GET - Retrieve a specific user by username
describe('GET /users/:username', () => {
  test("Retrieve a user by username", async () => {
    const results = await request(app)
    .get(`/users/${TESTDATA.currentUsername}`)
    .send({_token: `${TESTDATA.userToken}` })
    expect(results.statusCode).toBe(200);
    expect(results.body.user.username).toEqual("johndoe");
  })
  test("Responds with a 404 if it cannot find the requested user ", async () => {
    const results = await request(app)
    .get(`/users/johnnie`)
    .send({ _token: `${TESTDATA.userToken}`})
    expect(results.statusCode).toBe(404);
    // expect(results.body.user.username).toEqual("johndoe");
  })
})

// PATCH - Update a user 
describe('PATCH /users/:username', () => {
  // jest.setTimeout(3 * 60 * 1000)
  test("Updates a single a user's first_name with a selective update", async () => {
    debugger;
    const results = await request(app)
    .patch(`/users/${TESTDATA.currentUsername}`)
    .send({
      // username: 'johndoe',
      password: 'pwd1',
      first_name: 'Johnathan',
      last_name: 'Doe',
      email: 'jdoe@email.com',
      photo_url: 'www.photos.com/johndoe',
      // is_admin: true,
      _token: `${TESTDATA.userToken}`
    });
    debugger;
    expect(results.statusCode).toBe(200);
    expect(results.body.user.first_name).toBe('Johnathan');
  })
  test("Prevents a bad user update", async () => {
    debugger;
    const results = await request(app)
    .patch(`/users/${TESTDATA.currentUsername}`)
    .send({
      nick_name: true, 
      _token: `${TESTDATA.userToken}`
    });
    expect(results.statusCode).toBe(400);
   })
})

// DElETE - Remove a user from the database

describe('DELETE /users/:username', () => {
  test("Delete a user", async () => {
    const results = await request(app)
    .delete(`/users/${TESTDATA.currentUsername}`)
    .send({_token: TESTDATA.userToken})
    expect(results.statusCode).toBe(200);
    expect(results.body.message).toEqual('User Deleted')
  })
  test('Forbids a user from deleting another user', async () => {
    const results = await request(app)
    .delete(`/users/janedoe`)
    .send({_token: TESTDATA.userToken})
    expect(results.statusCode).toBe(401);
    expect(results.body.message).toEqual('Unauthorized')
  })
})
