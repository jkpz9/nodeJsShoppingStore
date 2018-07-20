module.exports = (req, res, next) => {
	if (req.isAuthenticated())
		if (req.user.isAdmin === 1)
			return next();
	req.flash('err_msg', 'You are not authorized');
	res.redirect('/shop');	
} 