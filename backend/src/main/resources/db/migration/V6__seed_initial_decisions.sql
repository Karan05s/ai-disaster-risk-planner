-- ============================================================
-- V6: Seed Initial Relocation Decisions (Tanmay - Decision Module)
-- Provides live workflow state (PENDING, APPROVED, OVERRIDDEN) for the dashboard
-- ============================================================

INSERT INTO relocation_decision (village_id, site_id, status, decided_by, decided_at, override_reason)
VALUES 
    ('VLG-001', 'SITE-001', 'APPROVED', 2, '2026-08-25 10:30:00+00', NULL),
    ('VLG-002', 'SITE-002', 'PENDING', NULL, NULL, NULL),
    ('VLG-003', 'SITE-001', 'PENDING', NULL, NULL, NULL),
    ('VLG-004', 'SITE-002', 'OVERRIDDEN', 2, '2026-08-26 14:15:00+00', 'Geological instability detected on primary path; redirected to district shelter model.'),
    ('VLG-005', 'SITE-001', 'PENDING', NULL, NULL, NULL)
ON CONFLICT DO NOTHING;
