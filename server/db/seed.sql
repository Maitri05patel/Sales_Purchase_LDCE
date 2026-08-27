-- Initial Seed Data for LDCE Store & Purchase Management System

-- 1. Departments (20+ LDCE Academic & Administrative Units)
INSERT INTO departments (code, name) VALUES
('CIVIL', 'Civil Engineering Department'),
('MECH', 'Mechanical Engineering Department'),
('ELEC', 'Electrical Engineering Department'),
('COMP', 'Computer Engineering Department'),
('EC', 'Electronics & Communication Engineering'),
('IT', 'Information Technology Department'),
('IC', 'Instrumentation & Control Engineering'),
('CHEM', 'Chemical Engineering Department'),
('BIOMED', 'Biomedical Engineering Department'),
('AUTO', 'Automobile Engineering Department'),
('RUBBER', 'Rubber Technology Department'),
('PLASTIC', 'Plastic Technology Department'),
('TEXTILE', 'Textile Engineering Department'),
('APPLIED', 'Applied Mechanics Department'),
('SCIENCE', 'Science & Humanities Department'),
('LIBRARY', 'Central Library'),
('STORE', 'Central Store & Purchase Section'),
('ADMIN', 'Administrative Branch'),
('ACCOUNTS', 'Accounts & Finance Branch'),
('HOSTEL', 'Boys & Girls Hostels')
ON CONFLICT (code) DO NOTHING;

-- 2. Core Users / Faculty
INSERT INTO users (dept_id, name, email, designation, role, phone) VALUES
(4, 'Dr. C. H. Vithalani', 'principal@ldce.ac.in', 'Principal', 'Principal', '079-26302887'),
(17, 'Prof. M. B. Patel', 'store_officer@ldce.ac.in', 'Store Officer', 'StoreOfficer', '9825000001'),
(4, 'Dr. D. A. Parikh', 'hod_comp@ldce.ac.in', 'Professor & HOD', 'HOD', '9825000002'),
(2, 'Dr. H. N. Shah', 'hod_mech@ldce.ac.in', 'Professor & HOD', 'HOD', '9825000003'),
(1, 'Dr. A. M. Malek', 'hod_civil@ldce.ac.in', 'Professor & HOD', 'HOD', '9825000004'),
(19, 'Shri K. R. Vyas', 'accounts@ldce.ac.in', 'Accounts Officer', 'AccountsOfficer', '9825000005'),
(4, 'Prof. T. J. Raval', 'rep_comp1@ldce.ac.in', 'Associate Professor', 'DeptRep', '9825000006'),
(4, 'Prof. N. K. Patel', 'expert_comp1@ldce.ac.in', 'Associate Professor', 'ExpertMember', '9825000007'),
(2, 'Prof. R. J. Jani', 'expert_mech1@ldce.ac.in', 'Associate Professor', 'ExpertMember', '9825000008')
ON CONFLICT (email) DO NOTHING;

-- 3. CTE Demands (Sample Annual Proposals)
INSERT INTO cte_demands 
(fin_year, category, dept_id, item_name, qty, unit_rate, total_cost, gem_available, gem_id, grant_head, norm_qty, available_qty, stock_condition, lifespan, maint_plan, justification)
VALUES
('2026-27', 'IT Equipment', 4, 'High End Workstation for AI Lab', 10, 120000.00, 1200000.00, TRUE, 'GEM/2026/COMP/WKS', 'State Grant (TED-5)', 30, 20, 'Working', '5 Years', '3 Years Onsite Warranty', 'Required for Advanced AI & Machine Learning Postgraduate Laboratory setup.'),
('2026-27', 'Non-IT Equipment', 2, 'Universal Testing Machine 100kN', 1, 850000.00, 850000.00, TRUE, 'GEM/2026/MECH/UTM', 'State Grant (TED-11)', 2, 1, 'Non-Working', '10 Years', 'Annual Maintenance Contract', 'Existing 15 year old UTM is beyond economic repair. Essential for Material Testing Lab.'),
('2026-27', 'Furniture', 1, 'Dual Desk Classroom Furniture', 100, 6500.00, 650000.00, TRUE, 'GEM/2026/CIVIL/DESK', 'State Grant (TED-5)', 500, 400, 'Obsolete', '10 Years', 'Self Maintenance', 'For newly constructed Annex Building classrooms for UG Students.')
ON CONFLICT DO NOTHING;

-- 4. Sample Purchase Indent
INSERT INTO indents
(indent_no, fund_type, budget_head, dept_id, indenter_user_id, indent_date, item_name, item_description, quantity, unit_cost, total_cost, gem_details, status)
VALUES
('IND/2026-27/COMP/001', 'Govt Fund', 'State Grant (TED-5)', 4, 3, CURRENT_DATE, 'High End AI Workstation Computers', 'Intel Core i9 14th Gen, 64GB DDR5 RAM, 2TB NVMe SSD, NVIDIA RTX 4090 24GB GPU, 27 inch 4K Monitor, 3 Year Comprehensive Onsite Warranty.', 5, 150000.00, 750000.00, 'GeM Search Completed - Direct/Custom Bid Option', 'Initiated')
ON CONFLICT (indent_no) DO NOTHING;
