# LDCE Store & Purchase Management System

## Overview
The Store & Purchase Management System for L.D. College of Engineering (LDCE) digitalizes and automates the entire procurement workflow. It maintains a centralized database for all purchase requests, generates official notes, orders, certificates, and vouchers, and provides real-time tracking across all funding heads. 

The system works in synergy with the Government e-Marketplace (GeM) Portal and manages the complete lifecycle from demand aggregation to final payment.

## System Features
- **Master & Governance**: Role-based access, committee management.
- **Demand Aggregation (CTE)**: Annual budget aggregation and Statement 1-5 generation.
- **Indenting & Pre-Bidding**: Digital purchase indents, specs sheet generation, ATC, and Note Sheets in Gujarati.
- **EMD & Security Deposit Ledger**: Track financial instruments (EMD, e-PBG).
- **Scrutiny & Committee Approval**: DLPC/DPC agendas, MOMs, Rate Reasonability Certificates.
- **Receipt & Bill Passing**: Inward receipts, Technical Inspection, Central Store Stock Entry, and payment vouchers.
- **Non-GeM & Services**: Local repairs, comparative statements, non-GeM local purchases.
- **Dashboards**: Real-time status of grant utilization and procurement lifecycles.

## Technology Stack
- **Frontend**: Vanilla JavaScript, HTML5, CSS3, Vite
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (pg)
- **Document Generation**: docx (for DOCX exports)

## Project Structure
- `/client` - Frontend Vite application
- `/server` - Backend Node.js Express API
- `/documents_and_forms_specification.md` - Form field and output document specification
- `/procurement_system_overview_and_process.md` - High-level system architecture and process flows

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### Setup Backend
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file (Database credentials, Port).
4. Initialize database schemas:
   ```bash
   npm run db:init
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

### Setup Frontend
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
