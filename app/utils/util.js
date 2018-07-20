const ImageFilter = (req, file, cb) => {
	// accepted image only
	if (!file.originalName.match(/\.(jpg|jpeg|png|gif)$/)) {
		return cb(new Error('Only image files are allowed'), false);
	}
	cb(null, true);
};

module.exports = { ImageFilter };