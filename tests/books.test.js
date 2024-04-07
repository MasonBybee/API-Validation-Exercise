process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let book_isbn;

beforeEach(async () => {
  let result = await db.query(`
    INSERT INTO
      books (isbn, amazon_url,author,language,pages,publisher,title,year)
      VALUES(
        '123456789',
        'https://amazon.com/its_fun_to_put_random_things_in_my_code',
        'EasterEgg',
        'English',
        99999,
        'Truth Publishing',
        'Why Shawshank Redemption is the best movie of all time', 2024)
      RETURNING isbn`);

  book_isbn = result.rows[0].isbn;
});

describe("GET /books", function () {
  test("Gets book list containing 1 book", async function () {
    const response = await request(app).get("/books");
    const books = response.body.books;
    expect(books.length).toBe(1);
    expect(response.statusCode).toBe(200);
    expect(books[0]).toHaveProperty("amazon_url");
    expect(books[0]).toHaveProperty("author");
    expect(books[0]).toHaveProperty("language");
  });
});

describe("GET /books/:isbn", function () {
  test("successfully gets book with isbn", async function () {
    const response = await request(app).get(`/books/${book_isbn}`);
    const book = response.body.book;
    expect(response.statusCode).toBe(200);
    expect(response.body.book).toHaveProperty("isbn");
  });

  test("throws 404 error when isbn cannot be found", async function () {
    const response = await request(app).get(`/books/893102347`);
    expect(response.statusCode).toBe(404);
  });
});

describe("POST /books", function () {
  test("successfully creates a new book", async function () {
    const response = await request(app).post("/books").send({
      isbn: "23466233",
      amazon_url: "https://amazon.com/testing_express",
      author: "Test Ticuluar",
      language: "english",
      pages: 731,
      publisher: "Dingleberry Publishing",
      title: "testing_express",
      year: 2026,
    });
    expect(response.statusCode).toBe(201);
    expect(response.body.book).toHaveProperty("isbn");
  });

  test("fails to create book without necessary fields", async function () {
    const response = await request(app).post("/books").send({
      isbn: "32794782",
      title: "This shouldnt work",
    });
    expect(response.statusCode).toBe(400);
  });
});

describe("PUT /books/:isbn", function () {
  test("successfully updates a book", async function () {
    const response = await request(app).put(`/books/${book_isbn}`).send({
      amazon_url: "https://amazon.com/test_1_2_test_1_2_is_this_thing_on",
      author: "Gho Catchit",
      language: "english",
      pages: 420,
      publisher: "This is a Test Publishing",
      title: "Is your refrigerator running",
      year: 1999,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      book: {
        amazon_url: "https://amazon.com/test_1_2_test_1_2_is_this_thing_on",
        author: "Gho Catchit",
        isbn: "123456789",
        language: "english",
        pages: 420,
        publisher: "This is a Test Publishing",
        title: "Is your refrigerator running",
        year: 1999,
      },
    });
  });
  test("prevents updating book when missing info", async function () {
    const response = await request(app).put(`/books/${book_isbn}`).send({
      amazon_url: "https://amazon.com/testing_express",
      author: "Test Ticuluar",
    });
    expect(response.statusCode).toBe(400);
  });
  test("throws 404 error when isbn cannot be found", async function () {
    const response = await request(app).put(`/books/93452722`).send({
      amazon_url: "https://amazon.com/testing_express",
      author: "Test Ticuluar",
      language: "english",
      pages: 731,
      publisher: "Dingleberry Publishing",
      title: "testing_express",
      year: 2026,
    });
    expect(response.statusCode).toBe(404);
  });
});

describe("DELETE /books/:isbn", function () {
  test("successfully deletes book", async function () {
    const response = await request(app).delete(`/books/${book_isbn}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: "Book deleted" });
  });
});

afterEach(async function () {
  await db.query("DELETE FROM books");
});

afterAll(async function () {
  await db.end();
});
