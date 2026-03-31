const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '24h' });
};

const authController = {
    register: async (req, res) => {
        try {
            const { name, email, password, phone, role } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ message: 'Email already registered' });
            }

            const user = new User({
                name,
                email,
                password,
                phone: phone || '',
                role: role || 'CUSTOMER',
                active: true
            });

            await user.save();

            const token = generateToken(user._id);

            res.status(201).json({
                message: 'User registered successfully',
                accessToken: token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone
                }
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            if (!user.active) {
                return res.status(403).json({ message: 'Account is deactivated' });
            }

            const isMatch = user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const token = generateToken(user._id);

            res.json({
                accessToken: token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    avatar: user.avatar
                }
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getProfile: async (req, res) => {
        try {
            const user = await User.findById(req.userId).select('-password');
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    logout: async (req, res) => {
        res.json({ message: 'Logged out successfully' });
    }
};

module.exports = authController;
