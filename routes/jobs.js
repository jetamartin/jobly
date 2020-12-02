const express = require("express");
const router = express.Router();
const jsonschema = require("jsonschema");

const isEmpty = require("../helpers/miscellaneous")
// Validation schema

// POST (aka add)
const addJobSchema = require("../schemas/addJobSchema.json");
const updateJobSchema = require("../schemas/updateJobSchema.json") 

const ExpressError = require("../helpers/expressError")
const Job = require("../models/jobs");
// const { SECRET_KEY } = require("../config");
// const { json } = require("express");
const { adminRequired, authRequired } = require('../middleware/auth');



/**
 * POST /jobs
 * Creates a new job and returns a new job {job: jobData}
 * 
 */
router.post('/', adminRequired, async (req, res, next) => {
  try {
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

router.get('/', authRequired, async (req, res, next) => {
  let jobs;
  try {
    // const {search, min_salary, min_equity } = req.query;
    let queryParams = req.query;
    if ('search' in queryParams) {
      jobs = await Job.searchByJobTitle(queryParams.search);
    } else if ('min_salary' in queryParams) {
      jobs = await Job.searchByMinSalary(queryParams.min_salary) 
    } else if ('min_equity' in queryParams) {
      jobs = await Job.searchByMinEquity(queryParams.min_equity)
    } else { // No query strings provided just return all companies
      jobs = await Job.getAll();
    }
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
router.get('/:id', authRequired, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    const job = await Job.getJob(id);
    return res.json({job}); 
  } catch (error) {
    return next(error)
  }
});


 /**
  * PATCH /jobs/:id
  * This route updates a job by its ID and returns an the newly updated job.
  * 
  * It should return JSON of {job: jobData}
  */
 router.patch('/:id', adminRequired, async (req, res, next) => {

  try {
    const id = parseInt(req.params.id)
    const validateJson = jsonschema.validate(req.body, updateJobSchema);
    if (!validateJson.valid) {
      //pass validation errors to error handler
      let listOfErrors = validateJson.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error)
    }
    if ("id" in req.body) {
      return next (new ExpressError('ID cannot be included in data to be updated for job', 400))
    }
    const job = await Job.updateJob(id, req.body);
    return res.json({job})
  } catch (error) {

    return next(error)
  }

})

  /**
   * DELETE /jobs/:id
   * This route deletes a job and returns a message.
   * It should return JSON of { message: "Job deleted" }
   */

  router.delete('/:id', adminRequired,  async (req, res, next) => {
    const id = parseInt(req.params.id)
    try {
      const job = await Job.remove(id)
      return res.json({message: 'Job Deleted'})
    } catch (error) {
      return next(error)
    }
  });

  module.exports = router; 