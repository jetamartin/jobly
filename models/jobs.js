/** Message class for message.ly */

const db = require("../db");
const ExpressError = require("../helpers/expressError");


/** Message on the site. */

class Job {
  static async create(jobInfo) {
    try {
      const {title, salary, equity, company_handle } = jobInfo;
      const newJob = await db.query(
        `INSERT INTO jobs
          (title, salary, equity, company_handle)
          VALUES ($1, $2, $3, $4)
          RETURNING title, salary, equity, company_handle`,
          [ title, salary, equity, company_handle ]
      );
      return newJob.rows[0];

    } catch (error) {
      return next(error)
    }
  }

  static async getAll() {
    try {
      const jobResults = await db.query(
        `SELECT id, title, company_handle
        FROM jobs `
      );
      return jobResults.rows;
    } catch (error) {
      return error
    }
  }

  static async searchByJobTitle(jobTitle) {
    try {
      const jobResults = await db.query(
        `SELECT title, company_handle
        FROM jobs
        WHERE title LIKE $1`,
        ['%' + jobTitle + '%']
      );
  
      if (jobResults.rows.length === 0) {
        throw { message: `There is no matching job title containing '${jobTitle}'`, status: 404 }
      }
      return jobResults.rows;

    } catch (error) {

      return error
    }
  
  }
  static async searchByMinSalary(minSalary) {
    try {
      const jobResults = await db.query(
        `SELECT title, company_handle, salary
          FROM jobs
          WHERE salary > $1`,
          [minSalary]
      );
      if (jobResults.rows.length === 0) {
        throw { message: `There are no jobs that match your minimum salary requirements of '$${minSalary}' `, status: 404 }
      }
      return jobResults.rows;
      
    } catch (error) {

      return error
    }
  }
  static async searchByMinEquity(minEquity) {
    try {
      const jobResults = await db.query(
        `SELECT title, company_handle, equity
          FROM jobs
          WHERE equity > $1`,
          [minEquity]
      );

      if (jobResults.rows.length === 0) {
        throw { message: `There are no jobs that have an equity > your minimum equity of '${minEquity}' `, status: 404 }
      }
      
      return jobResults.rows;

    } catch (error) {
      return error;
    }
  }
  static async getJob(id) {
    try {
      const jobResults = await db.query(
        `SELECT title, company_handle, salary, equity, date_posted
          FROM jobs
          WHERE id = $1`,
          [id]
      );

      if (jobResults.rows.length === 0) {
        throw { message: `There is no job with an id of '${id}' `, status: 404 }
      }
      
      return jobResults.rows[0];

    } catch (error) {
      return error;
    }
  }
  static async updateJob(id, data) {
    try {
      const jobResults = await db.query(
        `UPDATE jobs SET
          title = ($1),
          salary = ($2),
          equity = ($3),
          company_handle = ($4)
         WHERE id = $5
         RETURNING id, title, salary, equity, company_handle`, 
         [data.title, data.salary, data.equity, data.company_handle, id] 
      );
     

      if (jobResults.rows.length === 0) {
        throw { message: `There is no job with an id of '${id}' `, status: 404 }
      }
      
      return jobResults.rows[0];

    } catch (error) {
      return error;
    }
  }
  static async remove(id) {
    try {
      const result = await db.query(
        `DELETE FROM jobs
          WHERE id = $1
          RETURNING id`,
          [id]
      );
      if (result.rows.length === 0) {
        throw { message: `There is no job with and id of '${id}`, status: 404 }
      }
      return resuts.rows[0]
      
    } catch (error) {
      return error
    }
  }
}



module.exports = Job;
