const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db/db');

router.post('/register', async (req, res) => {
  const { name, usn, branch, semester, email, password, cgpa } = req.body;
  if (!name || !usn || !email || !password) return res.status(400).json({ error: 'Required fields missing.' });
  try {
    const [ex] = await db.query('SELECT student_id FROM students WHERE email=? OR usn=?', [email, usn]);
    if (ex.length) return res.status(409).json({ error: 'Email or USN already exists.' });
    const hash = await bcrypt.hash(password, 10);
    const [r] = await db.query(
      'INSERT INTO students (name,usn,branch,semester,email,password_hash,cgpa) VALUES (?,?,?,?,?,?,?)',
      [name, usn, branch||null, semester||null, email, hash, cgpa||null]
    );
    const token = jwt.sign({ student_id: r.insertId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, student_id: r.insertId, name });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
  try {
    const [rows] = await db.query('SELECT * FROM students WHERE email=?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials.' });
    const s = rows[0];
    if (!await bcrypt.compare(password, s.password_hash)) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = jwt.sign({ student_id: s.student_id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, student: { student_id: s.student_id, name: s.name, email, branch: s.branch, semester: s.semester, cgpa: s.cgpa } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/forgot-password', async (req, res) => {
  const { email, usn, new_password } = req.body;
  if (!email || !usn || !new_password) return res.status(400).json({ error: 'All fields required.' });
  try {
    const [rows] = await db.query('SELECT student_id FROM students WHERE email=? AND usn=?', [email, usn]);
    if (!rows.length) return res.status(404).json({ error: 'No account found with this email and USN combination.' });
    const hash = await require('bcryptjs').hash(new_password, 10);
    await db.query('UPDATE students SET password_hash=? WHERE student_id=?', [hash, rows[0].student_id]);
    res.json({ message: 'Password reset successfully.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
