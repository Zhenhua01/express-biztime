"use strict";

const express = require("express");
const { NotFoundError } = require("../expressError");

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

/** Creates new invoice, returns obj of
 * new invoice: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}*/

router.post("/", async function (req, res, next) {
  const { comp_code, amt } = req.body;

  const result = await db.query(
    `INSERT INTO invoices (comp_code, amt)
          VALUES ($1, $2)
          RETURNING id, amt, paid, add_date, paid_date`,
    [comp_code, amt],
  );
  const invoice = result.rows[0];
  return res.status(201).json({ invoice });

});


/** Update invoice, returns updated
 * invoice object: {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */

 router.put("/:id", async function (req, res, next) {
  const { amt } = req.body;
  const id = req.params.id;

  const result = await db.query(
    `UPDATE invoices
           SET amt=$1
           WHERE id = $2
           RETURNING id, amt, paid, add_date, paid_date`,
    [amt, id]
  );

  const invoice = result.rows[0];

  if (!invoice) {
    throw new NotFoundError(`No matching invoice: ${id}`);
  };

  return res.json({ invoice });
});

/** Delete invoice, returning {status: "Deleted"} */

router.delete("/:id", async function (req, res, next) {
  const id = req.params.id;

  const result = await db.query(
    `DELETE FROM invoices
    WHERE id = $1
    RETURNING id`,
    [id],
  );

  const invoice = result.rows[0];

  if (!invoice) {
    throw new NotFoundError(`No matching invoice: ${id}`);
  };

  return res.json({ status: "Deleted" });
});




module.exports = router;