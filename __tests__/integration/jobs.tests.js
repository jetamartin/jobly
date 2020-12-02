process.env.NODE_ENV = "test"
const request = require("supertest");
// const { get } = require("../../app");
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



// GET  - Retrieve all jobs
describe('GET /jobs', () => {
  test("Retrieve all jobs", async () => {
    const results = await request(app)
    .get('/jobs')
    .send({
      "_token": TESTDATA.userToken
    });
    expect(results.statusCode).toBe(200);
    expect(results.body.jobs[0].title).toEqual("Software Eng");
  })
  test("Retrieve job based on search criteria (name)", async () => {
    const results = await request(app)
    .get("/jobs?search=Software Eng")
    .send({
      _token: TESTDATA.userToken
    });
    expect(results.statusCode).toBe(200);
    expect(results.body.jobs[0].title).toEqual("Software Eng");
  })

})


// POST - Add a new job
describe('POST /jobs', () => {
  test("Add a job", async () => {
    const results = await request(app)
    .post('/jobs')
    .send({
      title: 'Web Designer',
      salary: 80000,
      equity: 0.30,
      company_handle: 'CW',
      _token: TESTDATA.userToken
    });
    expect(results.statusCode).toBe(201);
    expect(results.body.job.title).toEqual("Web Designer");
  })
  test("Prevents creating a job without required title field", async () => {
    const results = await request(app)
    .post('/jobs')
    .send({
      salary: 80000,
      equity: 0.30,
      company_handle: 'CW',
      _token: TESTDATA.userToken
    });
    expect(results.statusCode).toBe(400);
  })
})


// GET - Retrieve a specific job by id
describe('GET /jobs/:id', () => {
  test("Retrieve a job", async () => {
    const results = await request(app)
    .get(`/jobs/${TESTDATA.currentJobId}`)
    .send({
      _token: TESTDATA.userToken
    });
    expect(results.statusCode).toBe(200);
    expect(results.body.job.title).toEqual("Software Eng");
  })
  test("Responds with a 404 if job with id can't be found", async () => {
    const results = await request(app)
    .get(`/jobs/99`)
    .send({
      _token: TESTDATA.userToken
    });
    expect(results.statusCode).toBe(404);
  })
})

// PATCH - Update a job 
describe('PATCH /jobs/:id', () => {
  test("Update a field of an existing job", async () => {
    const results = await request(app)
    .patch(`/jobs/${TESTDATA.currentJobId}`)
    .send({
      title: 'Full Stack Web Developer',
      salary: 125000,
      equity: 0.50,
      company_handle: 'CW',
      _token: TESTDATA.userToken
    });
    expect(results.statusCode).toBe(200);
    expect(results.body.job.salary).toBe("125000.00");
    expect(results.body.job.title).toEqual("Full Stack Web Developer");
  })
  test("Patch request responds with a 404 if it cannot find the job by id", async () => {
    const results = await request(app)
    .patch(`/jobs/99`)
    .send({
      title: 'Full Stack Web Developer',
      salary: 125000,
      equity: 0.50,
      company_handle: 'CW',
      _token: TESTDATA.userToken
    });
    expect(results.statusCode).toBe(404);
  })
})

// DElETE - Remove a job from the database
describe('DELETE /jobs/:id', () => {
  test("Delete a job", async () => {
    const results = await request(app)
    .delete(`/jobs/${TESTDATA.currentJobId}`)
    .send({_token: TESTDATA.userToken})
    expect(results.statusCode).toBe(200);
    expect(results.body.message).toEqual('Job Deleted')
  })
  test("Responds with a 404 if it cannot find the job by id", async () => {
    const results = await request(app)
    .delete(`/jobs/0`)
    .send({_token: TESTDATA.userToken})
    expect(results.statusCode).toBe(404);
  })
})
