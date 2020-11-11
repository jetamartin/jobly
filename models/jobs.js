/** Message class for message.ly */

const db = require("../db");
const ExpressError = require("../helpers/expressError");


/** Message on the site. */

class Job {
  static async create(jobInfo) {
    debugger;
    try {
      const {title, salary, equity, company_handle } = jobInfo;
      const newJob = await db.query(
        `INSERT INTO jobs
          (title, salary, equity, company_handle)
          VALUES ($1, $2, $3, $4)
          RETURNING title, salary, equity, company_handle`,
          [ title, salary, equity, company_handle ]
      );
      debugger;
      return newJob.rows[0];

    } catch (error) {
      return next(error)
    }
  }
}
module.exports = Job;
