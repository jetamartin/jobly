/** Message class for message.ly */

const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

class Company {
   /**
   * Retrive all companies
   */
  static async getAll() {
    const companyResults = await db.query(
      `SELECT 
        name, handle
      FROM companies `
    );
    return companyResults.rows;
  }

  /**
   * Search for companies by name
   * @param {*} name 
   */
  static async searchByName(name) {
    const companyResults = await db.query(
      `SELECT name,
              handle
      FROM companies 
      WHERE name LIKE $1`,
      ['%' + name + '%']
    );

    if (companyResults.rows.length === 0) {
      throw { message: `There is no matching name '${name}`, status: 404 }
    }
    return companyResults.rows;
  }

  /**
   * Find Companies that match min_employee & max_employee search param values
   * @param {*} queryParams 
   */
  static async searchByEmployeeCount(queryParams) {
    const {min_employees, max_employees} = queryParams;
    if (min_employees && max_employees) {
      if (min_employees > max_employees) {
        throw {message: `max_employees cannot be less than min_employees`, status: 400}
      } else {
        const companyResults = await db.query(
          `SELECT name, handle
            FROM companies
            WHERE num_employees BETWEEN $1 AND $2`,
            [min_employees, max_employees]
        );
      }
    } else { // Either a min_employees or max-employees
      if (min_employees ) {
        const companyResults = await db.query(
          `SELECT name, handle
            FROM companies
            WHERE num_employees >= $1`,
            [min_employees]
        );
      } else { // only max_employees value specified
        const companyResults = await db.query(
          `SELECT name, handle
            FROM companies
            WHERE num_employees <= $1`,
            [max_employees]
        );
      }
    }
    const companyResults = await db.query(
      `SELECT name, handle, num_employees
        FROM companies
        WHERE num_employees <= $1`,
        [max_employees] 
    ); 
    return companyResults.rows;
  }

  /**
   * Create a new company
   * @param {*} companyInfo 
   */
  static async create(companyInfo) {
    const {handle, name, num_employees, description, logo_url } = companyInfo;

    const duplicateCheck = await db.query(
      `SELECT handle 
            FROM companies 
            WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0]) {
      throw new ExpressError(
        `There already exists a company with handle '${handle}`,
        400
      );
    }
    const newCompany = await db.query(
      `INSERT INTO companies
        (handle, name, num_employees, description, logo_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING handle, name, num_employees, description, logo_url`,
        [ handle, name, num_employees, description, logo_url  ]
    );
    return newCompany.rows[0];
  }

  /**
   * Find a company based on it's handle
   * @param {*} handle 
   */
  static async get(handle) { 
    const companyResults = await db.query(
      `SELECT handle, name, num_employees, description, logo_url
        FROM companies
        WHERE handle = $1`, 
        [handle] 
    )
    if (!companyResults.rows[0] ) {
      throw new ExpressError(`No company exist with ${handle} handle`, 404);
    }
    const jobsResults = await db.query(
      `SELECT title FROM jobs
      WHERE company_handle = $1`,
      [handle]       
    )

    const company = companyResults.rows[0];
    company.jobs = jobsResults.rows;
    return company;
  }

  /**
   * Update an existing company based on user provided data
   * @param {*} handle 
   * @param {*} data 
   */
  static async update(handle, data) { 
    let { query, values } = sqlForPartialUpdate(
      "companies",
      data,
      "handle",
      handle
    );

    const result = await db.query(query, values);
    if (result && result.rows && result.rows.length > 0) {
      const company = result.rows[0];
      return company
    }
    else {
      throw new ExpressError(`No company exist with ${handle} handle`, 404);
    }
  }

  /**
   * Remove a company with the matching handle
   * @param {*} handle 
   */
  static async remove(handle) {
    const result = await db.query(
      `DELETE FROM companies 
         WHERE handle = $1 
         RETURNING handle`,
        [handle]);

    if (result.rows.length === 0) {
      throw { message: `There is no company with a handle '${handle}`, status: 404 }
    }
  }
}

module.exports = Company;
