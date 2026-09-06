-- PostgreSQL Schema for LDCE Store & Purchase Management System
-- Database: ldce_purchase_sales
-- ACID Compliant, strict FK constraints, indexed for performance

-- Extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Departments Master Table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Master Table (Faculty, Staff, Store Officers, Principal)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    dept_id INT REFERENCES departments(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    designation VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL, -- HOD, DeptRep, ExpertMember, StoreOfficer, Principal, AccountsOfficer, DLPCMember
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Committee Setup & Governance Table
CREATE TABLE IF NOT EXISTS committees (
    id SERIAL PRIMARY KEY,
    committee_name VARCHAR(150) NOT NULL,
    committee_type VARCHAR(50) NOT NULL, -- DLPC, DPC, WriteOff, DisciplineExpert, DeptRep
    discipline VARCHAR(100),
    dept_id INT REFERENCES departments(id) ON DELETE CASCADE,
    member_ids INT[] NOT NULL, -- Array of user IDs
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CTE Annual Demands Table (Statements 1 to 5)
CREATE TABLE IF NOT EXISTS cte_demands (
    id SERIAL PRIMARY KEY,
    fin_year VARCHAR(10) NOT NULL, -- e.g. 2026-27
    category VARCHAR(50) NOT NULL, -- Non-IT Equipment, IT Equipment, Furniture, Books, Maintenance
    dept_id INT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    item_name VARCHAR(250) NOT NULL,
    qty INT NOT NULL CHECK (qty > 0),
    unit_rate NUMERIC(14,2) NOT NULL CHECK (unit_rate >= 0),
    total_cost NUMERIC(14,2) NOT NULL CHECK (total_cost >= 0),
    gem_available BOOLEAN NOT NULL DEFAULT TRUE,
    gem_id VARCHAR(100),
    grant_head VARCHAR(100) NOT NULL, -- TED-5, TED-11, Center Grant, Other
    against_condemn BOOLEAN DEFAULT FALSE,
    norm_qty INT DEFAULT 0,
    available_qty INT DEFAULT 0,
    procurement_year VARCHAR(50) DEFAULT '-',
    stock_condition VARCHAR(50) DEFAULT 'Working',
    lifespan VARCHAR(50) DEFAULT '10 Years',
    maint_plan TEXT DEFAULT 'Through Department Technical Staff & AMC',
    approx_usage TEXT DEFAULT 'For UG/PG Laboratory & Research Practicals',
    procurement_model VARCHAR(50) DEFAULT 'New Purchase',
    annual_expenditure NUMERIC(14,2),
    disposal_procedure TEXT DEFAULT 'Through Institute Scrap / Condemnation Committee',
    is_standard_software VARCHAR(20) DEFAULT 'N/A',
    software_type VARCHAR(50) DEFAULT 'N/A',
    justification TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Submitted', -- Draft, Submitted, Approved, CTE_Consolidated
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Purchase Indents Table (Govt / Non-Govt Fund)
CREATE TABLE IF NOT EXISTS indents (
    id SERIAL PRIMARY KEY,
    indent_no VARCHAR(50) UNIQUE NOT NULL,
    fund_type VARCHAR(20) NOT NULL CHECK (fund_type IN ('Govt Fund', 'Non-Govt Fund')),
    budget_head VARCHAR(100) NOT NULL,
    dept_id INT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    indenter_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    indent_date DATE NOT NULL DEFAULT CURRENT_DATE,
    item_name VARCHAR(250) NOT NULL,
    item_description TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(14,2) NOT NULL CHECK (unit_cost >= 0),
    total_cost NUMERIC(14,2) NOT NULL CHECK (total_cost >= 0),
    gem_details VARCHAR(150),
    status VARCHAR(50) DEFAULT 'Initiated', -- Initiated, Specs_Defined, Admin_Approved, Bid_Published, Scrutinized, Sanctioned, Completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Specification & Consignee Master Table
CREATE TABLE IF NOT EXISTS specifications (
    id SERIAL PRIMARY KEY,
    indent_id INT UNIQUE NOT NULL REFERENCES indents(id) ON DELETE CASCADE,
    item_name VARCHAR(250) NOT NULL,
    detailed_specs TEXT NOT NULL,
    spec_params JSONB, -- Dynamic specification key-value pairs
    notes TEXT,
    expert_signatures INT[], -- Array of Expert Member User IDs who signed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Consignee Department Quantities Table
CREATE TABLE IF NOT EXISTS consignee_allocations (
    id SERIAL PRIMARY KEY,
    spec_id INT NOT NULL REFERENCES specifications(id) ON DELETE CASCADE,
    dept_id INT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Additional Terms & Conditions (ATC) Table
CREATE TABLE IF NOT EXISTS atc_terms (
    id SERIAL PRIMARY KEY,
    indent_id INT UNIQUE NOT NULL REFERENCES indents(id) ON DELETE CASCADE,
    delivery_location VARCHAR(250) NOT NULL,
    installation_scope TEXT NOT NULL,
    service_interval VARCHAR(50) NOT NULL,
    response_time VARCHAR(50) NOT NULL,
    max_downtime VARCHAR(50) NOT NULL,
    warranty_period VARCHAR(50) NOT NULL,
    local_office_clause VARCHAR(150) NOT NULL,
    epbg_percentage NUMERIC(5,2) DEFAULT 5.00,
    emd_amount NUMERIC(14,2) DEFAULT 0.00,
    custom_clauses JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Purchase Initiation Office Notes (Gujarati Note Sheets)
CREATE TABLE IF NOT EXISTS note_sheets (
    id SERIAL PRIMARY KEY,
    note_no VARCHAR(50) UNIQUE NOT NULL,
    indent_id INT REFERENCES indents(id) ON DELETE SET NULL,
    dept_id INT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    scheme_year VARCHAR(150) NOT NULL,
    item_name_guj VARCHAR(250) NOT NULL,
    qty_str VARCHAR(50) NOT NULL,
    total_amount NUMERIC(14,2) NOT NULL,
    amount_words_guj VARCHAR(300) NOT NULL,
    procurement_mode VARCHAR(50) NOT NULL, -- GeM Bid, Custom Bid, Direct Purchase
    budget_head VARCHAR(100) NOT NULL,
    chk_a_verified BOOLEAN DEFAULT FALSE,
    chk_c_verified BOOLEAN DEFAULT FALSE,
    content_guj TEXT NOT NULL, -- Full editable Gujarati note sheet content
    status VARCHAR(50) DEFAULT 'Pending Principal Sanction', -- Draft, Submitted, Approved, Rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. EMD & Security Deposit (e-PBG) Ledger (Synced with LDCE-Bid EMD_e-PBG details)
CREATE TABLE IF NOT EXISTS financial_instruments (
    id SERIAL PRIMARY KEY,
    sr_no VARCHAR(50), -- Sr.No (e.g. 17, 18, 20A)
    email_address VARCHAR(150), -- Email Address
    department VARCHAR(150), -- Department (e.g. Biomedical engg., IC engg., Central Store)
    item_service_name VARCHAR(250), -- Name of Item/ Service
    bid_order_no VARCHAR(100) NOT NULL, -- Bid Number
    bid_start_date DATE, -- Bid Start Date
    bid_end_date DATE, -- Bid End Date
    bid_estimated_value NUMERIC(14,2), -- Bid Estimated Value
    dd_number VARCHAR(50) NOT NULL, -- EMD / e-PBG number
    dd_date DATE NOT NULL, -- EMD/e-PBG dt
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0), -- Amount of EMD/ e-PBG submitted by the Party
    bank_name VARCHAR(150) NOT NULL, -- Name of Bank
    other_bank_specify VARCHAR(150), -- If other bank then Specify
    vendor_name VARCHAR(200) NOT NULL, -- Party Name
    vendor_address TEXT NOT NULL, -- Details of Party with Complete Address
    instrument_type VARCHAR(50) NOT NULL DEFAULT 'EMD', -- Nature of document (EMD, e-PBG / Security Deposit)
    inward_date DATE, -- Date of inward Original Hard Copy (before bid end date)
    remarks TEXT, -- Remarks (e.g. L1, 1172, etc.)
    amount_in_rupees VARCHAR(250), -- Amount in Rupees
    remarks_2 TEXT, -- Remarks-2
    status VARCHAR(50) DEFAULT 'Held in Store', -- Held in Store, Deposited in Account, Refunded to Vendor, Forfeited
    refund_ref VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Timestamp
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Migration safety for existing installations
ALTER TABLE financial_instruments ADD COLUMN IF NOT EXISTS sr_no VARCHAR(50);
ALTER TABLE financial_instruments ADD COLUMN IF NOT EXISTS email_address VARCHAR(150);
ALTER TABLE financial_instruments ADD COLUMN IF NOT EXISTS department VARCHAR(150);
ALTER TABLE financial_instruments ADD COLUMN IF NOT EXISTS item_service_name VARCHAR(250);
ALTER TABLE financial_instruments ADD COLUMN IF NOT EXISTS bid_start_date DATE;
ALTER TABLE financial_instruments ADD COLUMN IF NOT EXISTS bid_end_date DATE;
ALTER TABLE financial_instruments ADD COLUMN IF NOT EXISTS bid_estimated_value NUMERIC(14,2);
ALTER TABLE financial_instruments ADD COLUMN IF NOT EXISTS other_bank_specify VARCHAR(150);
ALTER TABLE financial_instruments ADD COLUMN IF NOT EXISTS inward_date DATE;
ALTER TABLE financial_instruments ADD COLUMN IF NOT EXISTS remarks TEXT;
ALTER TABLE financial_instruments ADD COLUMN IF NOT EXISTS amount_in_rupees VARCHAR(250);
ALTER TABLE financial_instruments ADD COLUMN IF NOT EXISTS remarks_2 TEXT;


-- 10. Bids Master Table
CREATE TABLE IF NOT EXISTS bids (
    id SERIAL PRIMARY KEY,
    bid_no VARCHAR(100) UNIQUE NOT NULL,
    indent_id INT REFERENCES indents(id) ON DELETE SET NULL,
    bid_publish_date DATE NOT NULL,
    bid_end_date DATE NOT NULL,
    bid_opening_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Published', -- Published, Evaluation_Phase, Finalized, Cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Technical Scrutiny Evaluation Matrix
CREATE TABLE IF NOT EXISTS scrutiny_details (
    id SERIAL PRIMARY KEY,
    bid_id INT NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
    bidder_name VARCHAR(200) NOT NULL,
    param_specs VARCHAR(20) DEFAULT 'Qualified',
    param_turnover VARCHAR(20) DEFAULT 'Qualified',
    param_atc VARCHAR(20) DEFAULT 'Qualified',
    final_tech_status VARCHAR(20) NOT NULL, -- Qualified, Disqualified
    disqualify_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. DLPC / DPC Committee Meetings & Sanctions
CREATE TABLE IF NOT EXISTS committee_meetings (
    id SERIAL PRIMARY KEY,
    committee_type VARCHAR(20) NOT NULL CHECK (committee_type IN ('DLPC', 'DPC')),
    meeting_ref VARCHAR(100) UNIQUE NOT NULL,
    meeting_date DATE NOT NULL,
    indent_id INT REFERENCES indents(id) ON DELETE SET NULL,
    bid_id INT REFERENCES bids(id) ON DELETE SET NULL,
    l1_vendor VARCHAR(200) NOT NULL,
    l1_amount NUMERIC(14,2) NOT NULL CHECK (l1_amount > 0),
    rate_reasonability TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    attendee_ids INT[] NOT NULL,
    chk_b_verified BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'Sanctioned',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Purchase / Work Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    order_no VARCHAR(100) UNIQUE NOT NULL,
    indent_id INT REFERENCES indents(id) ON DELETE RESTRICT,
    meeting_id INT REFERENCES committee_meetings(id) ON DELETE SET NULL,
    supplier_name VARCHAR(200) NOT NULL,
    supplier_address TEXT NOT NULL,
    total_value NUMERIC(14,2) NOT NULL CHECK (total_value > 0),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Technical Inspection & Goods Receipt
CREATE TABLE IF NOT EXISTS inspections (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES purchase_orders(id) ON DELETE RESTRICT,
    invoice_no_date VARCHAR(150) NOT NULL,
    receipt_date DATE NOT NULL,
    inspection_date DATE NOT NULL,
    serial_numbers TEXT NOT NULL,
    specs_verified BOOLEAN DEFAULT TRUE,
    accessories_ok BOOLEAN DEFAULT TRUE,
    working_status VARCHAR(50) DEFAULT 'Fully Functional & Accepted',
    inspector_ids INT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Pass for Payment Vouchers Table
CREATE TABLE IF NOT EXISTS payment_vouchers (
    id SERIAL PRIMARY KEY,
    voucher_no VARCHAR(50) UNIQUE NOT NULL,
    inspection_id INT NOT NULL REFERENCES inspections(id) ON DELETE RESTRICT,
    sanction_ref VARCHAR(100) NOT NULL,
    vendor_info TEXT NOT NULL,
    gross_amount NUMERIC(14,2) NOT NULL CHECK (gross_amount >= 0),
    stock_folio_no VARCHAR(100) NOT NULL,
    account_head VARCHAR(100) NOT NULL,
    sd_retained NUMERIC(14,2) DEFAULT 0.00,
    other_deductions NUMERIC(14,2) DEFAULT 0.00,
    net_payable NUMERIC(14,2) NOT NULL CHECK (net_payable >= 0),
    chk_de_verified BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'Passed for Payment',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Non-Working Equipment & Repair Requests Table (Matches LDCE Official Excel Register)
-- Columns: Sr. No. | Name | Purchase Date | Cost | Date Since Non-Working | Previously Repaired? | Date of Last Repair | Amount of Last Repair | Market Value | Approx Cost of Repairing
CREATE TABLE IF NOT EXISTS repair_requests (
    id SERIAL PRIMARY KEY,
    req_no VARCHAR(50) UNIQUE NOT NULL,
    sr_no VARCHAR(20),                          -- Col A: Sr. No.
    dept_id INT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    equipment_name VARCHAR(250) NOT NULL,        -- Col B: Name of Equipment/Instruments
    purchase_date DATE NOT NULL,                 -- Col C: Purchase Date
    original_cost NUMERIC(14,2) NOT NULL,        -- Col D: Cost of Purchase (Rs.)
    breakdown_date DATE NOT NULL,                -- Col E: Date Since Non Working
    prev_repaired BOOLEAN DEFAULT FALSE,         -- Col F: Weather Previously Repaired? Yes/No
    last_repair_date DATE,                       -- Col G: If previously repaired then date of repair
    last_repair_amount NUMERIC(14,2),            -- Col H: Amount of last repair
    last_repair_info VARCHAR(250),               -- Legacy combined field (date+amount text)
    market_value NUMERIC(14,2) NOT NULL,         -- Col I: Prevailing Market Value
    est_repair_cost NUMERIC(14,2) NOT NULL,      -- Col J: If Yes approximate cost of repairing
    fault_desc TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Submitted for Approval',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR FAST PERFORMANCE & HIGH DATA CAPACITY
CREATE INDEX IF NOT EXISTS idx_users_dept ON users(dept_id);
CREATE INDEX IF NOT EXISTS idx_cte_demands_dept ON cte_demands(dept_id, fin_year);
CREATE INDEX IF NOT EXISTS idx_indents_dept ON indents(dept_id, status);
CREATE INDEX IF NOT EXISTS idx_indents_fund ON indents(fund_type, budget_head);
CREATE INDEX IF NOT EXISTS idx_bids_indent ON bids(indent_id);
CREATE INDEX IF NOT EXISTS idx_financial_instruments_status ON financial_instruments(status, instrument_type);
CREATE INDEX IF NOT EXISTS idx_note_sheets_indent ON note_sheets(indent_id);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_status ON payment_vouchers(status);

-- TRIGGER FUNCTION TO AUTOMATICALLY UPDATE UPDATED_AT TIMESTAMP
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- CREATE TRIGGERS FOR ALL MAJOR TABLES
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT table_name 
               FROM information_schema.columns 
               WHERE column_name = 'updated_at' 
                 AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_update_timestamp ON %I;', tbl);
        EXECUTE format('CREATE TRIGGER trg_update_timestamp BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();', tbl);
    END LOOP;
END $$;
