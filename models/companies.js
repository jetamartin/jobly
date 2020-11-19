/** Message class for message.ly */

const db = require("../db");
const ExpressError = require("../helpers/expressError");


/** Message on the site. */

class Company {
  /**
   * 
   * 
   * 
   * 
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
   * 
   * @param {*} name 
   */
  static async searchByName(name) {
    // var nameVal = name1.replace(/"/g, "'");
    // let nameVal = `%${name}%`
    try {
      
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
      
    } catch (error) {
      return error
    }

  }

  /**
   * 
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
   * 
   * @param {*} companyInfo 
   */
  static async create(companyInfo) {
    try {
      const {handle, name, num_employees, description, logo_url } = companyInfo;
      const newCompany = await db.query(
        `INSERT INTO companies
          (handle, name, num_employees, description, logo_url)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING handle, name, num_employees, description, logo_url`,
          [ handle, name, num_employees, description, logo_url  ]
      );
      return newCompany.rows[0];

    } catch (error) {
      return error
    }
  }

  /**
   * 
   * @param {*} handle 
   */
  static async get(handle) { 
    try {
      debugger;

      const companyResults = await db.query(
        `SELECT handle, name, num_employees, description, logo_url
         FROM companies
         WHERE handle = $1`, 
         [handle] 
      )
      if (!companyResults.rows[0] ) {
        throw new ExpressError(`No company exist with ${handle} handle`, 404);
      }
      debugger
      const jobsResults = await db.query(
        `SELECT title FROM jobs
        WHERE company_handle = $1`,
        [handle]       
      )

      const company = companyResults.rows[0];
      company.jobs = jobsResults.rows;
      return company;
      } catch (error) {

        return error
    }
  }

  /**
   * 
   * @param {*} handle 
   * @param {*} data 
   */
  static async update(handle, data) { 
    try {
      debugger;
      const company = await db.query(
        `UPDATE companies SET
          name = ($1),
          num_employees = ($2),
          description = ($3),
          logo_url = ($4)
         WHERE handle = $5
         RETURNING handle, name, num_employees, description, logo_url`, 
         [data.name, data.num_employees, data.description, data.logo_url, handle] 
      )
      if (!company.rows[0] ) {
        throw new ExpressError(`No company exist with ${handle} handle`, 404);
      }

      return company.rows[0];
      
    } catch (error) {

      return error
    }
  }

  /**
   * 
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
// obj.hasOwnProperty("key") // true


