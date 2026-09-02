const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function seedAuth() {
  console.log('Seeding authentication data for users...');
  
  // Default password for all users
  const password = 'ldce@2026';
  const passwordHash = await bcrypt.hash(password, 10);
  console.log('Generated hash for default password.');

  // 1. Update all existing users to have this password hash
  await db.query('UPDATE users SET password_hash = $1', [passwordHash]);

  // 2. Ensure all standard demo accounts exist
  const demoUsers = [
    { dept_id: 4, name: 'Dr. C. H. Vithalani', email: 'principal@ldce.ac.in', designation: 'Principal', role: 'Principal', phone: '079-26302887' },
    { dept_id: 17, name: 'Prof. M. B. Patel', email: 'store@ldce.ac.in', designation: 'Store Officer', role: 'StoreOfficer', phone: '9825000001' },
    { dept_id: 17, name: 'Prof. M. B. Patel', email: 'store_officer@ldce.ac.in', designation: 'Store Officer', role: 'StoreOfficer', phone: '9825000001' },
    { dept_id: 4, name: 'Dr. D. A. Parikh', email: 'hod@ldce.ac.in', designation: 'Professor & HOD', role: 'HOD', phone: '9825000002' },
    { dept_id: 4, name: 'Dr. D. A. Parikh', email: 'hod_comp@ldce.ac.in', designation: 'Professor & HOD', role: 'HOD', phone: '9825000002' },
    { dept_id: 4, name: 'Prof. T. J. Raval', email: 'deptrep@ldce.ac.in', designation: 'Associate Professor', role: 'DeptRep', phone: '9825000006' },
    { dept_id: 4, name: 'Prof. T. J. Raval', email: 'rep_comp1@ldce.ac.in', designation: 'Associate Professor', role: 'DeptRep', phone: '9825000006' },
    { dept_id: 4, name: 'Prof. N. K. Patel', email: 'expert@ldce.ac.in', designation: 'Associate Professor', role: 'ExpertMember', phone: '9825000007' },
    { dept_id: 4, name: 'Prof. N. K. Patel', email: 'expert_comp1@ldce.ac.in', designation: 'Associate Professor', role: 'ExpertMember', phone: '9825000007' },
    { dept_id: 19, name: 'Shri K. R. Vyas', email: 'accounts@ldce.ac.in', designation: 'Accounts Officer', role: 'AccountsOfficer', phone: '9825000005' },
    { dept_id: 4, name: 'Prof. S. M. Desai', email: 'dlpc@ldce.ac.in', designation: 'Assistant Professor', role: 'DLPCMember', phone: '9825000009' }
  ];

  for (const u of demoUsers) {
    await db.query(
      `INSERT INTO users (dept_id, name, email, password_hash, designation, role, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) 
       DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, designation = EXCLUDED.designation`,
      [u.dept_id, u.name, u.email, passwordHash, u.designation, u.role, u.phone]
    );
  }

  const result = await db.query('SELECT id, name, email, role FROM users ORDER BY id ASC');
  console.log(`Successfully verified ${result.rows.length} users with credentials.`);
  console.table(result.rows);
  process.exit(0);
}

seedAuth().catch(err => {
  console.error('Error seeding auth:', err);
  process.exit(1);
});
