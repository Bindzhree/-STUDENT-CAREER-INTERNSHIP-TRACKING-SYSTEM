const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db/db');

router.get('/', auth, async (req, res) => {
  const { application_id } = req.query;
  let q = `SELECT ir.*, a.role, c.company_name FROM interview_rounds ir
    JOIN applications a ON ir.application_id = a.application_id
    JOIN companies c ON a.company_id = c.company_id
    WHERE a.student_id=?`;
  const params = [req.student.student_id];
  if (application_id) { q += ' AND ir.application_id=?'; params.push(application_id); }
  q += ' ORDER BY ir.interview_date DESC';
  const [rows] = await db.query(q, params);
  res.json(rows);
});

router.post('/', auth, async (req, res) => {
  const { application_id, round_number, round_type, interview_date, outcome, notes, prep_status } = req.body;
  if (!application_id) return res.status(400).json({ error: 'application_id required.' });
  const [check] = await db.query('SELECT application_id FROM applications WHERE application_id=? AND student_id=?',
    [application_id, req.student.student_id]);
  if (!check.length) return res.status(403).json({ error: 'Application not found.' });
  const [r] = await db.query(
    'INSERT INTO interview_rounds (application_id,round_number,round_type,interview_date,outcome,notes,prep_status) VALUES (?,?,?,?,?,?,?)',
    [application_id, round_number||1, round_type||null, interview_date||null, outcome||'Pending', notes||null, prep_status||'Not Started']
  );
  res.status(201).json({ round_id: r.insertId });
});

router.delete('/:id', auth, async (req, res) => {
  await db.query(
    'DELETE ir FROM interview_rounds ir JOIN applications a ON ir.application_id=a.application_id WHERE ir.round_id=? AND a.student_id=?',
    [req.params.id, req.student.student_id]
  );
  res.json({ message: 'Deleted.' });
});
router.patch('/:id/outcome', auth, async (req, res) => {
  const valid = ['Pending','Passed','Failed'];
  if (!valid.includes(req.body.outcome)) return res.status(400).json({ error: 'Invalid outcome.' });
  await db.query(
    'UPDATE interview_rounds ir JOIN applications a ON ir.application_id=a.application_id SET ir.outcome=? WHERE ir.round_id=? AND a.student_id=?',
    [req.body.outcome, req.params.id, req.student.student_id]
  );
  res.json({ message: 'Updated.' });
});
router.put('/:id', auth, async (req, res) => {
  const { round_number, round_type, interview_date, outcome, prep_status, notes } = req.body;
  try {
    await db.query(
      'UPDATE interview_rounds ir JOIN applications a ON ir.application_id=a.application_id SET ir.round_number=?, ir.round_type=?, ir.interview_date=?, ir.outcome=?, ir.prep_status=?, ir.notes=? WHERE ir.round_id=? AND a.student_id=?',
      [round_number, round_type, interview_date||null, outcome, prep_status, notes||null, req.params.id, req.student.student_id]
    );
    res.json({ message: 'Updated.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
