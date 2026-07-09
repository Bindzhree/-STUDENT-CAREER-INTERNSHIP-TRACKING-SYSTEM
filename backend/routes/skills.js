const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db/db');

router.get('/', auth, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM skills WHERE student_id=? ORDER BY skill_name', [req.student.student_id]);
  res.json(rows);
});

router.post('/', auth, async (req, res) => {
  const { skill_name, proficiency, source } = req.body;
  if (!skill_name) return res.status(400).json({ error: 'skill_name required.' });
  const [r] = await db.query('INSERT INTO skills (student_id,skill_name,proficiency,source) VALUES (?,?,?,?)',
    [req.student.student_id, skill_name, proficiency||'Beginner', source||'Manual']);
  res.status(201).json({ skill_id: r.insertId });
});

router.post('/bulk', auth, async (req, res) => {
  const { skills } = req.body;
  if (!Array.isArray(skills) || !skills.length) return res.status(400).json({ error: 'skills array required.' });
  const vals = skills.map(s => [req.student.student_id, s.skill_name, s.proficiency||'Beginner', s.source||'Resume']);
  await db.query('INSERT INTO skills (student_id,skill_name,proficiency,source) VALUES ?', [vals]);
  res.status(201).json({ inserted: skills.length });
});

router.delete('/:id', auth, async (req, res) => {
  await db.query('DELETE FROM skills WHERE skill_id=? AND student_id=?', [req.params.id, req.student.student_id]);
  res.json({ message: 'Deleted.' });
});

module.exports = router;
