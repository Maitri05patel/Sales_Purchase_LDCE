const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'ldce_store_purchase_secret_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// ROLE_PERMISSIONS mirror — enforced server-side
const ROLE_PERMISSIONS = {
  Principal: {
    dashboard: 'view', masters: 'view', cte: 'approve', indents: 'approve',
    notes: 'approve', financial: 'view', scrutiny: 'view', committee: 'approve',
    delivery: 'view', repairs: 'view', templates: 'view',
  },
  StoreOfficer: {
    dashboard: 'view', masters: 'manage', cte: 'view', indents: 'create',
    notes: 'create', financial: 'manage', scrutiny: 'create', committee: 'create',
    delivery: 'manage', repairs: 'manage', templates: 'view',
  },
  HOD: {
    dashboard: 'hidden', masters: 'hidden', cte: 'create', indents: 'create',
    notes: 'approve', financial: 'hidden', scrutiny: 'approve', committee: 'hidden',
    delivery: 'approve', repairs: 'create', templates: 'hidden',
  },
  DeptRep: {
    dashboard: 'hidden', masters: 'hidden', cte: 'create', indents: 'create',
    notes: 'create', financial: 'hidden', scrutiny: 'hidden', committee: 'hidden',
    delivery: 'create', repairs: 'hidden', templates: 'hidden',
  },
  ExpertMember: {
    dashboard: 'hidden', masters: 'hidden', cte: 'hidden', indents: 'create',
    notes: 'hidden', financial: 'hidden', scrutiny: 'create', committee: 'hidden',
    delivery: 'create', repairs: 'hidden', templates: 'hidden',
  },
  AccountsOfficer: {
    dashboard: 'hidden', masters: 'hidden', cte: 'hidden', indents: 'hidden',
    notes: 'hidden', financial: 'manage', scrutiny: 'hidden', committee: 'view',
    delivery: 'manage', repairs: 'hidden', templates: 'hidden',
  },
  DLPCMember: {
    dashboard: 'hidden', masters: 'hidden', cte: 'hidden', indents: 'hidden',
    notes: 'hidden', financial: 'hidden', scrutiny: 'view', committee: 'approve',
    delivery: 'hidden', repairs: 'hidden', templates: 'hidden',
  }
};

/**
 * Authenticate middleware — verifies JWT token from Authorization header
 * Attaches req.user = { id, name, email, role, dept_id } on success
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, error: 'Invalid authentication token.' });
  }
}

/**
 * Authorize middleware factory — checks if req.user.role is in the allowed roles list
 * Usage: authorize('StoreOfficer', 'Principal')
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Your role (${req.user.role}) is not authorized for this action. Required: ${allowedRoles.join(' or ')}`
      });
    }
    next();
  };
}

/**
 * Generate JWT token for a user
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      dept_id: user.dept_id,
      designation: user.designation
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

module.exports = {
  authenticate,
  authorize,
  generateToken,
  JWT_SECRET,
  ROLE_PERMISSIONS
};
