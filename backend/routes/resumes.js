const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db/db');

// GET all resumes
router.get('/', auth, async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM resumes WHERE student_id=? ORDER BY created_at DESC',
    [req.student.student_id]
  );
  res.json(rows);
});

// POST add resume
router.post('/', auth, async (req, res) => {
  const { version_name, file_url, uploaded_date, notes } = req.body;
  if (!version_name) return res.status(400).json({ error: 'version_name required.' });
  try {
    const [r] = await db.query(
      'INSERT INTO resumes (student_id,version_name,file_url,uploaded_date,notes) VALUES (?,?,?,?,?)',
      [req.student.student_id, version_name, file_url||null, uploaded_date||null, notes||null]
    );
    res.status(201).json({ resume_id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT edit resume
router.put('/:id', auth, async (req, res) => {
  const { version_name, file_url, uploaded_date, notes } = req.body;
  try {
    await db.query(
      'UPDATE resumes SET version_name=?,file_url=?,uploaded_date=?,notes=? WHERE resume_id=? AND student_id=?',
      [version_name, file_url||null, uploaded_date||null, notes||null, req.params.id, req.student.student_id]
    );
    res.json({ message: 'Updated.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE resume
router.delete('/:id', auth, async (req, res) => {
  await db.query(
    'DELETE FROM resumes WHERE resume_id=? AND student_id=?',
    [req.params.id, req.student.student_id]
  );
  res.json({ message: 'Deleted.' });
});

// GET resume usage stats — which resume used in how many applications
router.get('/stats', auth, async (req, res) => {
  const [rows] = await db.query(`
    SELECT r.resume_id, r.version_name, r.file_url, r.uploaded_date, r.notes,
      COUNT(a.application_id) AS total_used,
      SUM(CASE WHEN a.status='Selected' THEN 1 ELSE 0 END) AS selected
    FROM resumes r
    LEFT JOIN applications a ON r.resume_id = a.resume_id
    WHERE r.student_id = ?
    GROUP BY r.resume_id, r.version_name, r.file_url, r.uploaded_date, r.notes
    ORDER BY r.created_at DESC
  `, [req.student.student_id]);
  res.json(rows);
});

module.exports = router;