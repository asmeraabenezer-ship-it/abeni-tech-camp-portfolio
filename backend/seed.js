const mongoose = require('mongoose');
require('dotenv').config();

const ProjectSchema = new mongoose.Schema({
    title: String,
    category: String,
    imagePath: String,
    createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', ProjectSchema);

const projects = [
    { title: 'SaaS Dashboard', category: 'Web Development', imagePath: 'images/project1.png' },
    { title: 'Modern Logo Concept', category: 'Graphic Design', imagePath: 'images/logo1.jpg' },
    { title: 'Tech Brand Logo', category: 'Graphic Design', imagePath: 'images/logo2.jpg' },
    { title: 'Creative Event Poster', category: 'Graphic Design', imagePath: 'images/poster-design.jpg' },
    { title: 'Minimalist Poster', category: 'Graphic Design', imagePath: 'images/poster-design1.jpg' },
    { title: 'Marketing Campaign', category: 'Graphic Design', imagePath: 'images/poster-design2.jpg' },
    { title: 'Digital Art Poster', category: 'Graphic Design', imagePath: 'images/poster-design3.jpg' },
    { title: 'Corporate Identity', category: 'Graphic Design', imagePath: 'images/poster-design4.jpg' },
    { title: 'Cinematic Video Edit', category: 'Video Editing', imagePath: 'images/project3.png' }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/abeni_portfolio');
        await Project.deleteMany({});
        await Project.insertMany(projects);
        console.log('Database Seeded Successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
