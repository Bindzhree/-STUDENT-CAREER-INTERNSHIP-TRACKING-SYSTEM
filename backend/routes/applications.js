const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db/db');

async function getOrCreateCompany(name, industry, website) {
  const [ex] = await db.query('SELECT company_id FROM companies WHERE company_name=?', [name]);
  if (ex.length) return ex[0].company_id;
  const [r] = await db.query('INSERT INTO companies (company_name,industry,website) VALUES (?,?,?)', [name, industry||null, website||null]);
  return r.insertId;
}

router.get('/', auth, async (req, res) => {
  const [rows] = await db.query(`
    SELECT a.*, c.company_name, c.industry FROM applications a
    JOIN companies c ON a.company_id = c.company_id
    WHERE a.student_id=? ORDER BY a.applied_date DESC
  `, [req.student.student_id]);
  res.json(rows);
});

router.post('/', auth, async (req, res) => {
  const { company_name, industry, website, role, applied_date, platform, deadline } = req.body;
  if (!company_name || !role) return res.status(400).json({ error: 'company_name and role required.' });
  try {
    const company_id = await getOrCreateCompany(company_name, industry, website);
    const { resume_id } = req.body;
    const [r] = await db.query(
      'INSERT INTO applications (student_id,company_id,role,applied_date,platform,deadline,resume_id) VALUES (?,?,?,?,?,?,?)',
      [req.student.student_id, company_id, role, applied_date||null, platform||null, deadline||null, resume_id||null]
    );
    res.status(201).json({ application_id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id/status', auth, async (req, res) => {
  const valid = ['Applied','Assessment','Interview','Rejected','Selected'];
  if (!valid.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status.' });
  await db.query('UPDATE applications SET status=? WHERE application_id=? AND student_id=?',
    [req.body.status, req.params.id, req.student.student_id]);
  res.json({ message: 'Updated.' });
});

router.delete('/:id', auth, async (req, res) => {
  await db.query('DELETE FROM applications WHERE application_id=? AND student_id=?', [req.params.id, req.student.student_id]);
  res.json({ message: 'Deleted.' });
});
router.put('/:id', auth, async (req, res) => {
  const { role, platform, applied_date, deadline } = req.body;
  try {
    await db.query(
      'UPDATE applications SET role=?, platform=?, applied_date=?, deadline=?, resume_id=? WHERE application_id=? AND student_id=?',
      [role, platform||null, applied_date||null, deadline||null, req.body.resume_id||null, req.params.id, req.student.student_id]
    );
    res.json({ message: 'Updated.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
