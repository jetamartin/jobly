process.env.NODE_ENV = "test"

const request = require("supertest");
const { get } = require("../../app");

const app = require("../../app");
const db = require("../../db");

const {
  TESTDATA, 
  beforeEachHook, 
  afterEachHook, 
  afterAllHook} = require('./config');

beforeEach(async () => {
  await beforeEachHook(TESTDATA);
});

afterEach(async function () {
  await afterEachHook();
});

afterAll(async function () {
  await afterAllHook();
});



// GET  - Retrieve all companies
describe('GET /companies', () => {
  test("Retrieve all companies", async () => {
    jest.setTimeout(3 * 60 * 1000)
    const results = await request(app)
    .get('/companies')
    .send({
      _token: TESTDATA.userToken
    });
    expect(results.statusCode).toBe(200);
    expect(results.body.companies[0].handle).toEqual("CW");
  })
  test("Retrieve company based on search criteria", async () => {
    const results = await request(app)
    .get("/companies?search=Costco")
    .send({
      _token: TESTDATA.userToken
    });
    expect(results.statusCode).toBe(200);
    expect(results.body.companies[0].name).toEqual("Costco Wholesale Inc.");
  })

})
// POST - Add a company
describe('POST /companies', () => {
  test("Add a company", async () => {
    const results = await request(app)
    .post('/companies')
    .send({
      handle: 'T2',
      name: 'Test 2 company',
      num_employees: 1000,
      description: 'Test 2 company description',
      logo_url: 'www.T2_url.com', 
      _token: TESTDATA.userToken
    });
    expect(results.statusCode).toBe(201);
    expect(results.body.company.handle).toEqual("T2");
  })
  test('Prevents creating a company with duplicate handle', async () => {
    const results = await request(app)
    .post('/companies')
    .send({
      handle: 'CW',
      name: 'Test 2 company',
      num_employees: 1000,
      description: 'Test 2 company description',
      logo_url: 'www.T2_url.com', 
      _token: TESTDATA.userToken
    });
    expect(results.statusCode).toBe(400);
  })
})


// GET - Retrieve a specific company by handle
describe('GET /companies/:handle', () => {
  test("Retrieve a specific company", async () => {
    const results = await request(app)
    .get(`/companies/${TESTDATA.currentCompany.handle}`)
    .send({
      _token: TESTDATA.userToken
    })
    expect(results.statusCode).toBe(200);
    expect(results.body.company.handle).toEqual("CW");
  })
  test("Generates 404 if company cannot be found", async () => {
    const results = await request(app)
    .get(`/companies/XX`)
    .send({
      _token: TESTDATA.userToken
    })
    expect(results.statusCode).toBe(404);
  })
})

// PATCH - Update a company 
describe('PATCH /companies/:handle', () => {
  test("Update num_employees from 1000 to 1500", async () => {
    debugger;
    const results = await request(app)
    .patch(`/companies/${TESTDATA.currentCompany.handle}`)
    .send({
      name: 'Costco Wholesale Inc.',
      num_employees: 1500,
      // description: 'Warehouse Retailer',
      // logo_url: 'www.logo.com/cc'
      _token: TESTDATA.userToken
    });
    expect(results.statusCode).toBe(200);
    expect(results.body.company.num_employees).toEqual(1500);
    expect(results.body.company.handle).toEqual("CW");
  })
  test("Prevent an invalid update caused by failing to provide requred param (company_name)", async () => {
    const results = await request(app)
    .patch(`/companies/${TESTDATA.currentCompany.handle}`)
    .send({
      num_employees: 1500,
      description: 'Warehouse Retailer',
      logo_url: 'www.logo.com/cc',
      _token: TESTDATA.userToken
    });
    expect(results.statusCode).toBe(400);
  })
})

// DElETE - Remove a company from the database

describe('DELETE /companies/:handle', () => {
  test("Delete a company", async () => {
    const results = await request(app)
    .delete(`/companies/${TESTDATA.currentCompany.handle}`)
    .send({
      _token: TESTDATA.userToken
    });
    expect(results.statusCode).toBe(200);
    expect(results.body.message).toBe('Company Deleted');
  })
  test("Responds with 404 if company can't be found", async () => {
    const results = await request(app)
    .delete(`/companies/XX`)
    .send({
      _token: TESTDATA.userToken
    });
    expect(results.statusCode).toBe(404);
  })
})



