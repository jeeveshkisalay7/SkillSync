const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ error: 'Not authorized' });
        }
    }
    
    if (!token) {
        res.status(401).json({ error: 'Not authorized, no token' });
    }
};

const isRecruiter = (req, res, next) => {
    if (req.user && (req.user.role === 'recruiter' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden. Recruiter access required' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden. Admin access required' });
    }
};

module.exports = { protect, isRecruiter, isAdmin };
