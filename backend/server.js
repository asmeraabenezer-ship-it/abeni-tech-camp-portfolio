const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'abeni_tech_portfolio_jwt_secret_key_2026';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'abeni';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'abeni2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, '../images')));

// Auth Middleware
const requireAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization token required' });
    }
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/abeni_portfolio')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Model
const ProjectSchema = new mongoose.Schema({
    title: String,
    category: String,
    imagePath: String,
    projectLink: String,
    status: String,
    createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', ProjectSchema);

// Admin Auth Routes
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const isValidUser = !username || username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase();
    const isValidPass = password === ADMIN_PASSWORD;

    if (isValidUser && isValidPass) {
        const token = jwt.sign(
            { role: 'admin', username: username || ADMIN_USERNAME },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        return res.json({ success: true, token, message: 'Authentication successful' });
    }
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.get('/api/admin/verify', requireAuth, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// Public Route: Fetch all projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Setup Multer for Image Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Protected Route: Upload Project
app.post('/api/projects', requireAuth, upload.single('image'), async (req, res) => {
    try {
        const newProject = new Project({
            title: req.body.title,
            category: req.body.category,
            projectLink: req.body.projectLink || '',
            status: req.body.status || 'Fully Finished',
            imagePath: req.file ? `/uploads/${req.file.filename}` : req.body.imagePath
        });
        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Protected Route: Delete Project
app.delete('/api/projects/:id', requireAuth, async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

