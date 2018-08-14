const express = require('express');
const router = express.Router();
const Database = require('./../config/database');


// Carpetas x mes

// Carpetas x mes
router.get('/admin/count_carpetas_per_month', (req, res, next) => {
    Database.getCountCarpetasPerMonth(req.query.year, res);
});

/*
router.get('/total_year', (req, res, next) => {
    Database.getStats_TotalXYear(req.query.year, res);
});
*/

router.post('/admin/distribution_by_stage', (req, res, next) => {
    Database.getDistributionByStage(req.body.mask, req.body.value, res);
});

router.post('/admin/ops_by_client', (req, res, next) => {
    Database.getOpsByClientWithMask(req.body.mask, req.body.value, res);
});

module.exports = router;