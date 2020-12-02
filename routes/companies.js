// const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const jsonschema = require("jsonschema");

// Validation schema

// POST (aka add)
const addCompanySchema = require("../schemas/addCompanySchema.json"); 

// Patch (aka update a company info)
const updateCompanySchema = require("../schemas/updateCompanySchema.json"); 


const isEmpty = require("../helpers/miscellaneous")
const ExpressError = require("../helpers/expressError")
const Company = require("../models/companies");
// const { SECRET_KEY } = require("../config");
// const { json } = require("express");
const { adminRequired, authRequired } = require('../middleware/auth');




/** GET /companies - 
 *
 * Retrieves all company handles and their names unless query parameters are provided that
 * specify/constrain the intended results. The route should return JSON of 
 *      {companies: [companyData, .....]}
 * 
 * The allowable query string paramaters and their impact on results returned are as follows:
 * 
 *  -> search - filtered list of handles and names should be displayed based on the search term
 *     and if the name includes it.
 *  -> min_employees - titles and company handles should be displayed that have a number of 
 *     employees greater than the value of the query string parameter.
 *  -> max_employees - a list of titles and company handles should be displayed that have a
 *     number of employees less than the value of the query string parameter.
 * NOTE: If the min_employees parameter is greater than the max_employees parameter, respond
 *   with a 400 status and a message notifying that the parameters are incorrect.
 *
 **/

router.get('/', authRequired, async (req, res, next) => {
  let companies;
  try {
    const {search, min_employees, max_employees } = req.query;
    let queryParams = req.query;
    if ('search' in queryParams) {
      companies = await Company.searchByName(queryParams.search);
    } else if ( ('min_employees' in queryParams) || ('max_employees' in queryParams) ) {
      companies = await Company.searchByEmployeeCount(queryParams) 
    } else { // No query strings provided just return all companies
      companies = await Company.getAll();
    }
    return res.json({'companies': companies})

  } catch (error) {
    return next(error)
  }
});

/**
 * Add a new company 
 */

router.post('/', adminRequired, async (req, res, next) => {
  try {
    // debugger;
    const validateJson = jsonschema.validate(req.body, addCompanySchema);
    if (!validateJson.valid) {
      //pass validation errors to error handler
      let listOfErrors = validateJson.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error)
    }
    if (isEmpty(req.body)) {
      throw new ExpressError('Required info to create a new company is missing', 400);
    } else {
      const company = await Company.create(req.body)
      return res.status(201).json({ company });
    }
  } catch (error) {
    return next(error)
  }

})

/**
 * Get information about a specific company using company handle
 */
router.get('/:handle', authRequired, async (req, res, next) => {
  const { handle } = req.params
  try {
    const company = await Company.get(handle);
    return res.json({ company }); 
  } catch (error) {
    return next(error)
  }

});  

/**
 * Update a company's information 
 */

router.patch('/:handle', adminRequired, async (req, res, next) => {
  debugger;
  try {
    const { handle } = req.params;
    const validateJson = jsonschema.validate(req.body, updateCompanySchema);
    if (!validateJson.valid) {
      //pass validation errors to error handler
      let listOfErrors = validateJson.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error)
    }
    if ("handle" in req.body) {
      return next (new ExpressError('Handle cannot be included in data submitted for company', 400))
    }
  
    const company = await Company.update(handle, req.body);
    return res.json({company})
  } catch (error) {

    return next(error)
  }

})
/**
 * Delete a company from the database
 */
router.delete('/:handle', adminRequired, async (req, res, next) => {
  const { handle } = req.params; 
  try {
    const company = await Company.remove(handle)
    return res.json({ message: 'Company Deleted' })
  } catch (error) {
    return next(error)
  }
})
module.exports = router; 

