const router = require('express').Router();

router.get('/contactus', (req, res) => {
	 res.render('contactus');
});

module.exports = router;