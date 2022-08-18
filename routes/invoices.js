"use strict";

const express = require("express");
// const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");


/**Return info on invoices: like {invoices: [{id, comp_code}, ...]}*/

router.get("/", async function (req, res, next) {
  //add ORDER BY so you get same results each time
  const results = await db.query(`
    SELECT id, comp_code
        FROM invoices
        ORDER BY id`);
  const invoices = results.rows;
  return res.json({ invoices });
});

/**Returns {invoice: {id, amt, paid, add_date, paid_date,
 *  company: {code, name, description}} */

router.get("/:id", async function (req, res, next) {
  const id = req.params.id;
  const iResults = await db.query(`
    SELECT id, amt, paid, add_date, paid_date
        FROM invoices
        WHERE id = $1`, [id]);
  debugger;
  const invoice = iResults.rows[0];
  const cResults = await db.query(`
    SELECT c.code, c.name, c.description
        FROM companies c
        JOIN invoices i
        ON c.code = i.comp_code
        WHERE i.id = $1`, [id]);
  const company = cResults.rows[0];
  debugger;
  invoice.company = company;

  if (!invoice) {
    debugger;
    throw new NotFoundError(`No matching invoice: ${id}`);
  };

  return res.json({ invoice });
});



module.exports = router;