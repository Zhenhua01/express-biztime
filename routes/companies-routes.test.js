const request = require("supertest");

const app = require("../app");
let db = require("../db");

let testCompany;

beforeEach(async function () {
  await db.query("DELETE FROM companies");
  let result = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('TestCode', 'TestName', 'TestDescription')
    RETURNING code, name, description`);
  testCompany = result.rows[0];
});


/** GET /companies - returns `{companies: [company, ...]}` */

describe("GET /companies", function () {
  test("Gets a list of 1 company", async function () {
    const resp = await request(app).get(`/companies`);
    console.log(resp.body)
    expect(resp.body).toEqual({
      companies: [testCompany],
    });
  });
});