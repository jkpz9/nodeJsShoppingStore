const model = require('../models/cityModel');

const router = require('express').Router();

router.get('/cityList/:id', (req, res) => {

	model.fetchList(parseInt(req.params.id)).then(result =>{
		res.status(200).json({ cities: result });
	})
	.catch(error => {
		res.status(500).json({ cities: result });
	});
});

module.exports = router;