module.exports = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	} else {
		req.flash('warning_msg', 'You are not autheticated or the page is forbidden');
		res.redirect('/login');
	};
} 