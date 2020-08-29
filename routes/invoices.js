const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async function(req, res, next){
    try {
    const results = await db.query('SELECT id, comp_code FROM invoices ORDER BY comp_code');
    return res.json({invoices: results.rows})

    } catch(err) {
        return next(err)
    }
})

router.get('/:id', async function(req, res, next){
    try {
        let id = req.params.id;
        const results = await db.query('SELECT * FROM invoices AS i INNER JOIN companies AS C ON(i.comp_code = c.code) WHERE id=$1', [id]);

        if (results.rows.length === 0) {
            throw new ExpressError(`No invoice found for id: ${id}`, 404)
    }
        return res.json({invoice: results.rows})

    } catch(err) {
        return next(err)
    }
})

router.post('/', async function(req, res, next){
    try {
        let {comp_code, amt} = req.body;
        const results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date'
        , [comp_code, amt]);
        return res.json({invoice: results.rows})

    } catch(err) {
        return next(err)
    }
})

router.put('/:id', async function(req, res, next){
    try {
        let id = req.params.id;
        let {amt} = req.body;
        const results = await db.query('UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date',
        [amt, id])
        if (results.rows.length === 0) {
            throw new ExpressError(`No invoice found for id: ${id}`, 404)
          } else {
        return res.status(201).json({"invoice": results.rows[0]})
          }

    } catch(err) {
        return next(err)
    }
})

router.delete('/:id', async function(req, res, next){
    try {
        let id = req.params.id;
        const results = await db.query('DELETE FROM invoices WHERE id=$1 RETURNING id', [id])

        if (results.rows.length === 0) {
            throw new ExpressError(`No invoice for id: ${id}`, 404)
        } else {
            return res.json({"status": "deleted"});
        }
    } catch(err) {
        return next(err)
    }
})

module.exports = router;