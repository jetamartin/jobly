process.env.NODE_ENV = "test"
const request = require("supertest");
const { get } = require("../../app");


const app = require("../../app");
const db = require("../../db");
// const { TestScheduler } = require("jest");
// const { expect } = require("@jest/globals");

let idVal;

beforeEach(async () => {
  try {
    const companyResults = await request(app)
    .post('/companies')
    .send({
      handle: 'NF',
      name: 'NetFlix Inc.',
      num_employees: 1000,
      description: 'Streaming video service',
      logo_url: 'www.NF_url.com'
    });

    let jobResults = await db.query(`
    INSERT INTO
      jobs (title, salary, equity, company_handle)
      VALUES(
        'Full Stack Web Developer',
        100000,
        0.50,
        'NF'
      )
      RETURNING id, title, salary, equity, company_handle
    `);
  
    idVal = jobResults.rows[0].id
  } catch (error) {
    return error;
  }

});

afterEach(async function () {
  await db.query("DELETE FROM jobs");
});


afterAll(async function () {
  await db.end()
});

// GET  - Retrieve all jobs
describe('GET /jobs', () => {
  test("Retrieve all jobs", async () => {
    const results = await request(app)
    .get('/jobs')
    expect(results.statusCode).toBe(200);
    // expect(results.body.jobs[0]).toHaveProperty("title");
    expect(results.body.jobs[0].title).toEqual("Full Stack Web Developer");
  })
})
// POST - Add a company
describe('POST /jobs', () => {
  test("Add a job", async () => {
    const results = await request(app)
    .post('/jobs')
    .send({
      title: 'Web Designer',
      salary: 80000,
      equity: 0.30,
      company_handle: 'NF'
    });
    expect(results.statusCode).toBe(201);
    expect(results.body.job.title).toEqual("Web Designer");
  })
})


// GET - Retrieve a specific job by id
describe('GET /jobs/:id', () => {
  test("Retrieve a job", async () => {
    const results = await request(app)
    .get(`/jobs/${idVal}`)
    expect(results.statusCode).toBe(200);
    expect(results.body.job.title).toEqual("Full Stack Web Developer");
  })
})

// PATCH - Update a company 
describe('PATCH /jobs/:id', () => {
  test("Update a field of an existing job", async () => {
    const results = await request(app)
    .patch(`/jobs/${idVal}`)
    .send({
      title: 'Full Stack Web Developer',
      salary: 120000,
      equity: 0.30,
      company_handle: 'NF'
    });
    expect(results.statusCode).toBe(200);
    expect(results.body.job.salary).toBe("120000.00");
    expect(results.body.job.title).toEqual("Full Stack Web Developer");
  })
})

// // DElETE - Remove a job from the database

describe('DELETE /jobs/:id', async () => {
  test("Delete a job", async () => {
    debugger;
    const results = await request(app)
    .delete(`/jobs/${idVal}`)
    expect(results.statusCode).toBe(200);
    expect(results.body.message).toEqual('Job Deleted')
  })
})
