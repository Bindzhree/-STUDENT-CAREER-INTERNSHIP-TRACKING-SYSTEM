// require('dotenv').config();
// const express = require('express');
// const cors    = require('cors');
// const path    = require('path');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Serve frontend static files
// app.use(express.static(path.join(__dirname, '../frontend')));

// // Landing page route
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/landing.html'));
// });

// // App route
// app.get('/app', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/index.html'));
// });

// // API routes
// app.use('/api/auth',           require('./routes/auth'));
// app.use('/api/profile',        require('./routes/profile'));
// app.use('/api/skills',         require('./routes/skills'));
// app.use('/api/certifications', require('./routes/certifications'));
// app.use('/api/applications',   require('./routes/applications'));
// app.use('/api/interviews',     require('./routes/interviews'));
// app.use('/api/dashboard',      require('./routes/dashboard'));
// app.use('/api/resume',         require('./routes/resume'));
// app.use('/api/experience',     require('./routes/experience'));
// app.use('/api/resumes',        require('./routes/resumes'));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/index.html'));
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Landing page — must be BEFORE static middleware
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/landing.html'));
});

// App route
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// API routes
app.use('/api/auth',           require('./routes/auth'));
app.use('/api/profile',        require('./routes/profile'));
app.use('/api/skills',         require('./routes/skills'));
app.use('/api/certifications', require('./routes/certifications'));
app.use('/api/applications',   require('./routes/applications'));
app.use('/api/interviews',     require('./routes/interviews'));
app.use('/api/dashboard',      require('./routes/dashboard'));
app.use('/api/resume',         require('./routes/resume'));
app.use('/api/experience',     require('./routes/experience'));
app.use('/api/resumes',        require('./routes/resumes'));

// Serve static files (css, js, images) — AFTER named routes
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback — all other routes go to app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));