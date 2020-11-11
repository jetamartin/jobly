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
      return next(error)
    }

  }

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
      return next(error)
    }
  }

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

        return next(error)
    }
  }

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

      return next(error)
    }
  }

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




// obj.hasOwnProperty("key") // true

// ****************************************************

  /** given an isbn, return book data with that isbn:
   *
   * => {isbn, amazon_url, author, language, pages, publisher, title, year}
   *
   **/

  // static async findOne(isbn) {
  //   const bookRes = await db.query(
  //       `SELECT isbn,
  //               amazon_url,
  //               author,
  //               language,
  //               pages,
  //               publisher,
  //               title,
  //               year
  //           FROM books 
  //           WHERE isbn = $1`, [isbn]);

  //   if (bookRes.rows.length === 0) {
  //     throw { message: `There is no book with an isbn '${isbn}`, status: 404 }
  //   }

  //   return bookRes.rows[0];
  // }

  /** Return array of book data:
   *
   * => [ {isbn, amazon_url, author, language,
   *       pages, publisher, title, year}, ... ]
   *
   * */

  // static async findAll() {
  //   const booksRes = await db.query(
  //       `SELECT isbn,
  //               amazon_url,
  //               author,
  //               language,
  //               pages,
  //               publisher,
  //               title,
  //               year
  //           FROM books 
  //           ORDER BY title`);

  //   return booksRes.rows;
  // }

  /** create book in database from data, return book data:
   *
   * {isbn, amazon_url, author, language, pages, publisher, title, year}
   *
   * => {isbn, amazon_url, author, language, pages, publisher, title, year}
   *
   * */

  // static async create(data) {
  //   const result = await db.query(
  //     `INSERT INTO books (
  //           isbn,
  //           amazon_url,
  //           author,
  //           language,
  //           pages,
  //           publisher,
  //           title,
  //           year) 
  //        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
  //        RETURNING isbn,
  //                  amazon_url,
  //                  author,
  //                  language,
  //                  pages,
  //                  publisher,
  //                  title,
  //                  year`,
  //     [
  //       data.isbn,
  //       data.amazon_url,
  //       data.author,
  //       data.language,
  //       data.pages,
  //       data.publisher,
  //       data.title,
  //       data.year
  //     ]
  //   );
  //   return result.rows[0];
  // }

  /** Update data with matching ID to data, return updated book.

   * {isbn, amazon_url, author, language, pages, publisher, title, year}
   *
   * => {isbn, amazon_url, author, language, pages, publisher, title, year}
   *
   * */

  // static async update(isbn, data) {
  //   const result = await db.query(
  //     `UPDATE books SET 
  //           amazon_url=($1),
  //           author=($2),
  //           language=($3),
  //           pages=($4),
  //           publisher=($5),
  //           title=($6),
  //           year=($7)
  //           WHERE isbn=$8
  //       RETURNING isbn,
  //                 amazon_url,
  //                 author,
  //                 language,
  //                 pages,
  //                 publisher,
  //                 title,
  //                 year`,
  //     [
  //       data.amazon_url,
  //       data.author,
  //       data.language,
  //       data.pages,
  //       data.publisher,
  //       data.title,
  //       data.year,
  //       isbn
  //     ]
  //   );

  //   if (result.rows.length === 0) {
  //     throw { message: `There is no book with an isbn '${isbn}`, status: 404 }
  //   }

  //   return result.rows[0];
  // }

  /** remove book with matching isbn. Returns undefined. */

  // static async remove(isbn) {
  //   const result = await db.query(
  //     `DELETE FROM books 
  //        WHERE isbn = $1 
  //        RETURNING isbn`,
  //       [isbn]);

  //   if (result.rows.length === 0) {
  //     throw { message: `There is no book with an isbn '${isbn}`, status: 404 }
  //   }
  // }
// }
// WHERE name LIKE ${nameVal}`, 


module.exports = Company;
