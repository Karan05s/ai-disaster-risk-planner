-- ============================================================
-- V4: Seed Default Admin & Authority Users
-- Enables instant JWT authentication for ML sync & Dashboard Admin
-- Password for all seed users: admin123
-- BCrypt hash: $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG
-- ============================================================

INSERT INTO users (name, email, password_hash, role)
VALUES 
    ('System Administrator', 'admin@sih.gov.in', '$2a$10$qKbPqrES2/u6PjVx3XXyY.fYvGrqu7WAc2PkMZEzHBV0zmERgWAyq', 'ADMIN'),
    ('Disaster Management Authority', 'authority@sih.gov.in', '$2a$10$qKbPqrES2/u6PjVx3XXyY.fYvGrqu7WAc2PkMZEzHBV0zmERgWAyq', 'AUTHORITY'),
    ('Public Viewer', 'viewer@sih.gov.in', '$2a$10$qKbPqrES2/u6PjVx3XXyY.fYvGrqu7WAc2PkMZEzHBV0zmERgWAyq', 'VIEWER')
ON CONFLICT (email) DO NOTHING;
