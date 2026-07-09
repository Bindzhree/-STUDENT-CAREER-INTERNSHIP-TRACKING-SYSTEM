const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db/db');

router.get('/', auth, async (req, res) => {
  const sid = req.student.student_id;
  try {
    const [statusCounts] = await db.query(
      'SELECT status, COUNT(*) AS count FROM applications WHERE student_id=? GROUP BY status', [sid]);

    const [totalsRows] = await db.query(`
      SELECT COUNT(*) AS total,
        SUM(CASE WHEN status='Selected' THEN 1 ELSE 0 END) AS selected,
        SUM(CASE WHEN status='Rejected' THEN 1 ELSE 0 END) AS rejected,
        ROUND(SUM(CASE WHEN status='Selected' THEN 1 ELSE 0 END)*100.0/NULLIF(COUNT(*),0),1) AS success_rate
      FROM applications WHERE student_id=?`, [sid]);

    const [monthly] = await db.query(`
      SELECT DATE_FORMAT(applied_date,'%b %Y') AS month, COUNT(*) AS count
      FROM applications WHERE student_id=? AND applied_date >= DATE_SUB(CURDATE(), INTERVAL 18 MONTH)
      GROUP BY DATE_FORMAT(applied_date,'%Y-%m'), DATE_FORMAT(applied_date,'%b %Y')
      ORDER BY MIN(applied_date)`, [sid]);

    const [skills] = await db.query(
      'SELECT skill_name, proficiency FROM skills WHERE student_id=? ORDER BY skill_name', [sid]);

    const [interviewStats] = await db.query(`
      SELECT ir.outcome, COUNT(*) AS count FROM interview_rounds ir
      JOIN applications a ON ir.application_id=a.application_id
      WHERE a.student_id=? GROUP BY ir.outcome`, [sid]);

    const [certRows] = await db.query(
      'SELECT COUNT(*) AS total FROM certifications WHERE student_id=?', [sid]);

    const [recentApps] = await db.query(`
      SELECT a.application_id, a.role, a.status, a.applied_date, c.company_name
      FROM applications a JOIN companies c ON a.company_id=c.company_id
      WHERE a.student_id=? ORDER BY a.applied_date DESC LIMIT 5`, [sid]);

    res.json({
      statusCounts,
      totals: totalsRows[0],
      monthly,
      skills,
      interviewStats,
      certifications: certRows[0].total,
      recentApps
    });
  } catch (e) {
    console.error('Dashboard error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;