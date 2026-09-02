const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { authenticate, authorize } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================================
app.use('/api/auth', require('./routes/auth'));

// Health Check (public)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'LDCE Store & Purchase Management System API',
    database: 'PostgreSQL ldce_purchase_sales',
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// PROTECTED ROUTES (Authentication Required)
// All routes below require a valid JWT token
// ============================================================
app.use('/api', authenticate);

// Register Module Routes (all protected by authenticate above)
app.use('/api/masters', require('./routes/masters'));
app.use('/api/cte', require('./routes/cte'));
app.use('/api/indents', require('./routes/indents'));
app.use('/api/financial', require('./routes/financial'));
app.use('/api/scrutiny', require('./routes/scrutiny'));
app.use('/api/committee', require('./routes/committee'));
app.use('/api/delivery', require('./routes/delivery'));
app.use('/api/repairs', require('./routes/repairs'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/documents', require('./routes/documents'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err.stack);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` LDCE Store & Purchase API Server running on port ${PORT}`);
  console.log(` JWT Authentication: ENABLED`);
  console.log(` PostgreSQL DB Target: postgres://postgres:root@localhost:5432/ldce_purchase_sales`);
  console.log(`=======================================================`);
});