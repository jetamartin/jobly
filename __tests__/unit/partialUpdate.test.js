const sqlForPartialUpdate = require("../../helpers/partialUpdate");

// Code added 

process.env.NODE_ENV = "test"

const request = require("supertest");
const { get } = require("../../app");


const app = require("../../app");
const db = require("../../db");
const { expect } = require("@jest/globals");

let handleVal;

beforeEach(async () => {
  let result = await db.query(`
    INSERT INTO
     companies (handle, name, num_employees, description, logo_url)
     VALUES(
       'BB',
       'Best Buy Inc.',
        99,
       'Electronics Retailer',
       'www.bb_url.com'
      )
      RETURNING handle, num_employees, description
  `);
  debugger;
  handleVal = result.rows[0].handle
});

afterEach(async function () {
  await db.query("DELETE FROM companies");
});


afterAll(async function () {
  await db.end()
});



// End of code added

describe("partialUpdate()", () => {

  it("should generate a proper partial update query with just 1 field",
      function () {
    const table = 'companies';
    const items = {'num_employees': 100}
    const key = 'handle';
    const id = handleVal;
    const { query, values } = sqlForPartialUpdate(table, items, key, id)
    // debugger;
   
    expect(query).toBe("UPDATE companies SET num_employees=$1 WHERE handle=$2 RETURNING *");
    expect(values[0]).toBe(100)
    expect(values[1]).toBe('BB')

  });
  it("should generate a proper partial update query with multiple fields",
  function () {
    const table = 'companies';
    const items = {'num_employees': 100, 'description': 'Electronics and Appliance Retailer'}
    const key = 'handle';
    const id = handleVal;
    const { query, values } = sqlForPartialUpdate(table, items, key, id)
    debugger;
    // expect(query).stringContaining("UPDATE companies SET num_employees=$1 description=$2 WHERE handle=$3 RETURNING *");
    expect(query).toEqual("UPDATE companies SET num_employees=$1, description=$2 WHERE handle=$3 RETURNING *")
    expect(values[0]).toBe(100)
    expect(values[1]).toEqual('Electronics and Appliance Retailer')
    expect(values[2]).toBe('BB')
  });
  
});
