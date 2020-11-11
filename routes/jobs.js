const express = require("express");
const router = express.Router();
const jsonschema = require("jsonschema");

const isEmpty = require("../helpers/miscellaneous")
// Validation schema

// POST (aka add)
const addJobSchema = require("../schemas/addJobSchema.json"); 

const ExpressError = require("../helpers/expressError")
const Job = require("../models/jobs");
const { SECRET_KEY } = require("../config");
const { json } = require("express");


/**
 * POST /jobs
 * Creates a new job and returns a new job {job: jobData}
 * 
 */
router.post('/', async (req, res, next) => {
  try {
    debugger;
    const validateJson = jsonschema.validate(req.body, addJobSchema);
    if (!validateJson.valid) {
      //pass validation errors to error handler
      let listOfErrors = validateJson.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error)
    }
    if (isEmpty(req.body)) {
      throw new ExpressError('Required info to create a new company is missing', 400);
    } else {
      const job = await Job.create(req.body);
      debugger;
      return res.status(201).json({job});
    }
  } catch (error) {
    return next(error)
  }
})


/**
 * GET /jobs
 * List all the titles and company handles for all jobs,
 * ordered by the most recently posted jobs.
 * 
 * 'search' query - If the 'search' query string parameter is passed, 
 * a filtered list of titles and company handles will
 * be displayed based on the search term and if the 
 * job title includes it
 * 
 * 'min_salary' query - If the query string param is passed, titles
 *  and company  handles should be displayed that have a salary greater
 *  than the value of the query string parameter
 * 
 * 'min_equity' query - If the query string parameter is passed, a list of
 *  titles and company handles should be displayed that have an equity greater
 *  than the value of the query string parameter.
 * 
 *  return {job: jobData}
 */

router.get('/', async (req, res, next) => {
  let jobs;
  try {

    // Replace logic below with logic....
    // const {search, min_employees, max_employees } = req.query;
    // let queryParams = req.query;
    // if ('search' in queryParams) {
    //   companies = await Company.searchByName(queryParams.search);
    // } else if ( ('min_employees' in queryParams) || ('max_employees' in queryParams) ) {
    //   companies = await Company.searchByEmployeeCount(queryParams) 
    // } else { // No query strings provided just return all companies
    //   companies = await Company.getAll();
    // }
    return res.json({'jobs': jobs})

  } catch (error) {
    return next(error)
  }  

})



/**
 * GET /jobs/:id
 * This route should show information about a specific job including a 
 * key of company which is an object that contains all of the information
 * about the company associated with it.
 * 
 * It should return JSON of {job: jobData}
 */

 /**
  * PATCH /jobs/:id
  * This route updates a job by its ID and returns an the newly updated job.
  * 
  * It should return JSON of {job: jobData}
  */

  /**
   * DELETE /jobs/:id
   * This route deletes a job and returns a message.
   * It should return JSON of { message: "Job deleted" }
   */

  module.exports = router; 