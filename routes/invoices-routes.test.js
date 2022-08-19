const request = require("supertest");

const app = require("../app");
let db = require("../db");
// TODO: Change to invoice
let testCompany;

beforeEach(async function () {
  await db.query("DELETE FROM companies");
  let result = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('TestCode', 'TestName', 'TestDescription')
    RETURNING code, name, description`);
  testCompany = result.rows[0];
});


describe("GET /company", function() {
  it("Gets a list of cats", async function() {
    const resp = await request(app).get(`/cats`);

    expect(resp.body).toEqual({ cats: [pickles] });
  });
});