const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db/db');

router.get('/', auth, async (req, res) => {
  const [rows] = await db.query(
    'SELECT student_id,name,usn,branch,semester,email,resume_url,cgpa,created_at FROM students WHERE student_id=?',
    [req.student.student_id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found.' });
  res.json(rows[0]);
});

router.put('/', auth, async (req, res) => {
  const { name, branch, semester, cgpa, resume_url, avatar_url } = req.body;
  await db.query('UPDATE students SET name=?,branch=?,semester=?,cgpa=?,resume_url=?,avatar_url=? WHERE student_id=?',
    [name, branch, semester, cgpa, resume_url, avatar_url||null, req.student.student_id]);
  res.json({ message: 'Updated.' });
});
router.put('/password', auth, async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) return res.status(400).json({ error: 'Both fields required.' });
  try {
    const [rows] = await db.query('SELECT password_hash FROM students WHERE student_id=?', [req.student.student_id]);
    const valid = await require('bcryptjs').compare(current_password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });
    const hash = await require('bcryptjs').hash(new_password, 10);
    await db.query('UPDATE students SET password_hash=? WHERE student_id=?', [hash, req.student.student_id]);
    res.json({ message: 'Password changed successfully.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
