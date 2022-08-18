"use strict"
/** Routes about companies. */

const express = require("express");
const { NotFoundError } = require("../expressError");

const router = new express.Router();
const db = require("../db");


/** GET / - returns `{companies: [companies, ...] }` */

router.get("/", async function (req, res, next) {
  //add ORDER BY so you get same results each time
  const results = await db.query(
    `SELECT code, name
        FROM companies
        ORDER BY code`);
  const companies = results.rows;

  return res.json({ companies });
});

/** GET /[code] - return data about one
 * company: `{company: {code, name, description}}` */

router.get("/:code", async function (req, res, next) {
  const code = req.params.code;

  const results = await db.query(`
    SELECT code, name, description
        FROM companies
        WHERE code = $1`, [code]);
  const company = results.rows[0];

  const iResults = await db.query(`
    SELECT id
        FROM invoices
        WHERE comp_code = $1`, [code]);
  const invoices = iResults.rows;

  company.invoices = invoices.map(i => i.id);

  if (!company) {
    debugger;
    throw new NotFoundError(`No matching company: ${code}`);
  };

  return res.json({ company });
});

/** Create new company {},
 * returns obj of new company: {company: {code, name, description}}*/

router.post("/", async function (req, res, next) {
  const { code, name, description } = req.body;

  const result = await db.query(
    `INSERT INTO companies (code, name, description)
           VALUES ($1, $2, $3)
           RETURNING code, name, description`,
    [code, name, description],
  );
  const company = result.rows[0];

  return res.status(201).json({ company });
});


/** Update company {},
 * returns update company object: {company: {code, name, description}} */

router.put("/:code", async function (req, res, next) {
  const { name, description } = req.body;
  const code = req.params.code;

  const result = await db.query(
    `UPDATE companies
           SET name=$1,
               description=$2
           WHERE code = $3
           RETURNING code, name, description`,
    [name, description, code],
  );

  const company = result.rows[0];

  if (!company) {
    throw new NotFoundError(`No matching company: ${code}`);
  };
  return res.json({ company });
});

/** Delete company, returning {status: "deleted"} */

router.delete("/:code", async function (req, res, next) {
  const code = req.params.code;

  const result = await db.query(
    `DELETE FROM companies
    WHERE code = $1
    RETURNING code`,
    [code],
  );

  const company = result.rows[0];

  if (!company) {
    throw new NotFoundError(`No matching company: ${code}`);
  };

  return res.json({ status: "deleted" });
});


module.exports = router;