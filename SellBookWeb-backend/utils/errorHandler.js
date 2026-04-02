let errorHandler = function (err, req, res, next) {
    console.error('Error:', err);

    if (err.name === 'ValidationError') {
        let messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            message: 'Validation Error',
            errors: messages
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            message: `Invalid ${err.path}: ${err.value}`
        });
    }

    if (err.code === 11000) {
        let field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            message: `${field} already exists`
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            message: 'Token expired'
        });
    }

    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error'
    });
};

let notFound = function (req, res, next) {
    let error = new Error(`Not found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
};

module.exports = {
    errorHandler,
    notFound
};
