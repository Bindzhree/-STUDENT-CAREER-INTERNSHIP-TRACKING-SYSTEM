const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db/db');

// GET all experiences
router.get('/', auth, async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM internship_experience WHERE student_id=? ORDER BY start_date DESC',
    [req.student.student_id]
  );
  res.json(rows);
});

// POST add experience
router.post('/', auth, async (req, res) => {
  const { company_name, role, start_date, end_date, type, stipend, description, skills_used, certificate_url, status } = req.body;
  if (!company_name || !role) return res.status(400).json({ error: 'company_name and role required.' });
  try {
    const [r] = await db.query(
      'INSERT INTO internship_experience (student_id,company_name,role,start_date,end_date,type,stipend,description,skills_used,certificate_url,status) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [req.student.student_id, company_name, role, start_date||null, end_date||null, type||'Remote', stipend||null, description||null, skills_used||null, certificate_url||null, status||'Ongoing']
    );
    res.status(201).json({ experience_id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT edit experience
router.put('/:id', auth, async (req, res) => {
  const { company_name, role, start_date, end_date, type, stipend, description, skills_used, certificate_url, status } = req.body;
  try {
    await db.query(
      'UPDATE internship_experience SET company_name=?,role=?,start_date=?,end_date=?,type=?,stipend=?,description=?,skills_used=?,certificate_url=?,status=? WHERE experience_id=? AND student_id=?',
      [company_name, role, start_date||null, end_date||null, type, stipend||null, description||null, skills_used||null, certificate_url||null, status, req.params.id, req.student.student_id]
    );
    res.json({ message: 'Updated.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE experience
router.delete('/:id', auth, async (req, res) => {
  await db.query(
    'DELETE FROM internship_experience WHERE experience_id=? AND student_id=?',
    [req.params.id, req.student.student_id]
  );
  res.json({ message: 'Deleted.' });
});

module.exports = router;