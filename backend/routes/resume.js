const router   = require('express').Router();
const multer   = require('multer');
const pdfParse = require('pdf-parse');
const auth     = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
// const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const KNOWN_SKILLS = [
  'javascript','python','java','c++','c#','typescript','react','vue','angular',
  'node.js','express','django','flask','mysql','postgresql','mongodb','sqlite','redis',
  'html','css','tailwind','bootstrap','git','docker','linux','aws','azure',
  'machine learning','sql','nosql','rest api','graphql','figma','agile','scrum',
  'data structures','algorithms','oops','dbms','networking'
];
const CERT_PLATFORMS = ['coursera','udemy','nptel','google','aws','microsoft','linkedin learning','edx','hackerrank'];

function extractSkills(text) {
  const lower = text.toLowerCase();
  return KNOWN_SKILLS.filter(s => lower.includes(s)).map(s => ({
    skill_name: s.charAt(0).toUpperCase() + s.slice(1),
    proficiency: 'Intermediate', source: 'Resume'
  }));
}

function extractCertifications(text) {
  return text.split('\n')
    .filter(line => CERT_PLATFORMS.some(p => line.toLowerCase().includes(p)) && line.length < 200)
    .slice(0, 8)
    .map(line => ({ cert_name: line.trim().substring(0, 150), platform: CERT_PLATFORMS.find(p => line.toLowerCase().includes(p)) || '', completion_date: null, proof_url: '' }));
}

function extractProjects(text) {
  const match = text.match(/projects?([\s\S]*?)(?:education|experience|skills|certif|$)/i);
  if (!match) return [];
  return match[1].split('\n').filter(l => l.trim().length > 10).slice(0, 5)
    .map(line => ({ title: line.trim().substring(0, 150), description: '', tech_stack: '', project_url: '' }));
}

router.post('/parse', auth, upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'PDF file required.' });
  try {
    const data = await pdfParse(req.file.buffer);
    res.json({
      skills: extractSkills(data.text),
      certifications: extractCertifications(data.text),
      projects: extractProjects(data.text)
    });
  } catch (e) { res.status(500).json({ error: 'Failed to parse PDF.' }); }
});

module.exports = router;
