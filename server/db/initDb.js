const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'ldce_purchase_sales';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'root';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);

async function initDatabase() {
  console.log(`Connecting to PostgreSQL at ${dbHost}:${dbPort}...`);
  
  // Step 1: Connect to default 'postgres' database to ensure target DB exists
  const rootClient = new Client({
    user: dbUser,
    host: dbHost,
    database: 'postgres',
    password: dbPassword,
    port: dbPort,
  });

  try {
    await rootClient.connect();
    console.log('Connected to PostgreSQL root server.');

    const res = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (res.rowCount === 0) {
      console.log(`Database '${dbName}' does not exist. Creating...`);
      await rootClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database '${dbName}' created successfully.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }
  } catch (err) {
    console.error('Error connecting to root PostgreSQL server:', err.message);
    process.exit(1);
  } finally {
    await rootClient.end();
  }

  // Step 2: Connect to target database and execute Schema & Seed
  const targetClient = new Client({
    user: dbUser,
    host: dbHost,
    database: dbName,
    password: dbPassword,
    port: dbPort,
  });

  try {
    await targetClient.connect();
    console.log(`Connected to database '${dbName}'.`);

    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    console.log('Applying database schema...');
    await targetClient.query(schemaSql);
    console.log('Database schema applied successfully.');

    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    console.log('Seeding initial data...');
    await targetClient.query(seedSql);
    console.log('Database seeded successfully.');

    console.log('=== DATABASE INITIALIZATION COMPLETED SUCCESSFULLY ===');
  } catch (err) {
    console.error('Error applying schema or seed data:', err);
    process.exit(1);
  } finally {
    await targetClient.end();
  }
}

initDatabase();
