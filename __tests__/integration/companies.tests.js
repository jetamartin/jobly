process.env.NODE_ENV = "test"

const request = require("supertest");
const { get } = require("../../app");


const app = require("../../app");
const db = require("../../db");
// const { TestScheduler } = require("jest");
// const { expect } = require("@jest/globals");

let handleVal;

beforeEach(async () => {
  let results = await db.query(`
  INSERT INTO
    companies (handle, name, num_employees, description, logo_url)
    VALUES(
      'T1',
      'Test Company 1',
      50,
      'Just a test case company',
      'www.test1_url.com'
    )
    RETURNING handle, num_employees, description
  `)
 
  handleVal = results.rows[0].handle
});

afterEach(async function () {
  await db.query("DELETE FROM companies");
});


afterAll(async function () {
  await db.end()
});

// GET  - Retrieve all companies
describe('GET /companies', () => {
  test("Retrieve all companies", async () => {
    const results = await request(app)
    .get('/companies')
    expect(results.statusCode).toBe(200);
    // expect(results.body.companies[0]).toHaveProperty("handle");
    expect(results.body.companies[0].handle).toEqual("T1");
  })

})
// POST - Add a company
describe('POST /companies', () => {
  test("Add a company", async () => {
    const results = await request(app)
    .post('/companies')
    .send({
      handle: 'T2',
      name: 'Test 2 company',
      num_employees: 1000,
      description: 'Test 2 company description',
      logo_url: 'www.T2_url.com'
    });
    expect(results.statusCode).toBe(201);
    expect(results.body.company.handle).toEqual("T2");
  })
})


// GET - Retrieve a specific company by handle
describe('GET /companies/:handle', () => {
  test("Retrieve a specific company", async () => {
    const results = await request(app)
    .get(`/companies/${handleVal}`)
    expect(results.statusCode).toBe(200);
    expect(results.body.company.handle).toEqual("T1");
  })
})

// PATCH - Update a company 
describe('PATCH /companies/:handle', () => {
  test("Update a field of an existing company", async () => {
    const results = await request(app)
    .patch(`/companies/${handleVal}`)
    .send({
      name: 'Test Company 1',
      num_employees: 1500,
      description: 'Just a test case company',
      logo_url: 'www.test1_url.com'
    });
    expect(results.statusCode).toBe(200);
    expect(results.body.company.num_employees).toEqual(1500);
    expect(results.body.company.handle).toEqual("T1");
  })
})

// DElETE - Remove a company from the database

describe('DELETE /companies/:handle', async () => {
  test("Delete a company", async () => {
    const results = await request(app)
    .delete(`/companies/${handleVal}`)
    expect(results.statusCode).toBe(200);
    expect(results.body.message).toBe('Company Deleted')
  })
})



// let book_isbn;

// beforeEach(async () => {
//   let result = await db.query(`
//     INSERT INTO
//      books (isbn, amazon_url, author, language, pages, publisher, title, year)
//      VALUES(
//        '4937989888',
//        'https://amazon.com/cat_stories',
//        'Katmandu',
//        'english',
//        199,
//        'Animal Express Publishing',
//        'Your cat can be wonderful',
//        2017
//       )
//       RETURNING isbn
//   `);
//   book_isbn = result.rows[0].isbn
// });

// afterEach(async function () {
//   console.log('======>>> afterEACH - DELETE FROM BOOKS')
//   await db.query("DELETE FROM BOOKS");
// });


// afterAll(async function () {
//   await db.end()
// });

// describe('GET /books', () => {
//   test("Get all books", async () => {
//     const response = await request(app)
//     .get('/books')
//     expect(response.statusCode).toBe(200);
//     expect(response.body.books[0]).toHaveProperty("isbn")
//   })
//   test("Get a specific book by isbn#", async () => {
//     const response = await request(app)
//     .get(`/books/${book_isbn}`)
//     expect(response.statusCode).toBe(200);
//     expect(response.body.book.isbn).toEqual(`${book_isbn}`)
//   })
//   test("If book with isbn not found", async () => {
//     const response = await request(app)
//     .get('/books/123433')
//     expect(response.statusCode).toBe(404)
//   })
// })



// describe('POST /books', () => {
//   test("Creates a new book", async () => {
//     const response = await request(app)
//     .post('/books')
//     .send({
//       isbn: '123456789',
//       amazon_url: 'https:amazon.com/cats123',
//       author: "test1",
//       language: "english", 
//       pages: 1000,
//       publisher: "Aticus Publishing",
//       title:"The mysterious life of cats",
//       year: 2020
//     });
//   expect(response.statusCode).toBe(201)
//   expect(response.body.book).toHaveProperty("isbn")
//   })

//   test("Prevents creating book with missing required fields ", async () => {
//     const response = await request(app)
//       .post(`/books`)
//       .send({publisher: 'XYZ publishing'});
//     expect(response.statusCode).toBe(400)

//   });
// }) 

// describe('PUT /books/:id', () => {
//   test("Update title of existing book", async () => {
//     const response = await request(app)
//     .put(`/books/${book_isbn}`)
//     .send({
//       amazon_url: 'https://amazon.com/cat_stories',
//       author: 'Katmandu',
//       language: 'english',
//       pages: 199,
//       publisher: 'Animal Express Publishing',
//       title: "Your cat can be wonderful but challenging",
//       year: 2017
//       }) 
//       expect(response.statusCode).toBe(200);
//       expect(response.body.book.title).toBe("Your cat can be wonderful but challenging")
//   })
//   test("Don't allow book to be updated if book contains invalid fields", async()=>{
//     const response = await request(app)
//     .put(`/books/${book_isbn}`)
//     .send({
//       amazon_url: 'https://amazon.com/dog_stories',
//       author: 'DogMandu',
//       invalid_field: "This field is invalid", 
//       language: 'english',
//       pages: 188,
//       publisher: 'Animal Express Publishing',
//       title: "Your Dog may be smarter than you",
//       year: 2018
//     });
//     expect(response.statusCode).toBe(400)
//   })
//   test("Don't allow book update if isbn also included in body", async () => {
//     const response = await request(app)
//     .put(`/books/${book_isbn}`)
//     .send({
//       isbn: '122223333333'
//     })
//     expect(response.statusCode).toBe(400);
//     expect(response.body.error.message).toBe("ISBN cannot be included in data submitted for book")
//   })

// })
// describe('/DELETE /book/:isbn', () => {
//   test("Successful deletion of an existing book", async() => {
//     const response = await request(app)
//     .delete(`/books/${book_isbn}`)
//     expect(response.statusCode).toBe(200);
//     expect(response.body.message).toBe('Book deleted')
//   })
//   test("Error message if book with id can't be found", async() => {
//     const response = await request(app)
//     .delete(`/books/1234896`)
//     expect(response.statusCode).toBe(404);
//   })
// })