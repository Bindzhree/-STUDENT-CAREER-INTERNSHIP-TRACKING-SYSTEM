const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db/db');

router.get('/', auth, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM certifications WHERE student_id=? ORDER BY completion_date DESC', [req.student.student_id]);
  res.json(rows);
});

router.post('/', auth, async (req, res) => {
  const { cert_name, platform, completion_date, expiry_date, proof_url } = req.body;
  if (!cert_name) return res.status(400).json({ error: 'cert_name required.' });
  const [r] = await db.query(
    'INSERT INTO certifications (student_id,cert_name,platform,completion_date,expiry_date,proof_url) VALUES (?,?,?,?,?,?)',
    [req.student.student_id, cert_name, platform||null, completion_date||null, expiry_date||null, proof_url||null]
  );
  res.status(201).json({ cert_id: r.insertId });
});

router.post('/bulk', auth, async (req, res) => {
  const { certifications } = req.body;
  if (!Array.isArray(certifications) || !certifications.length) return res.status(400).json({ error: 'certifications array required.' });
  const vals = certifications.map(c => [req.student.student_id, c.cert_name, c.platform||null, c.completion_date||null, c.expiry_date||null, c.proof_url||null]);
  await db.query('INSERT INTO certifications (student_id,cert_name,platform,completion_date,expiry_date,proof_url) VALUES ?', [vals]);
  res.status(201).json({ inserted: certifications.length });
});

router.delete('/:id', auth, async (req, res) => {
  await db.query('DELETE FROM certifications WHERE cert_id=? AND student_id=?', [req.params.id, req.student.student_id]);
  res.json({ message: 'Deleted.' });
});

module.exports = router;
