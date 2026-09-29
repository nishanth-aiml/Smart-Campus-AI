-- VSB Smart Campus Seed Data
USE smart_campus;

-- Clear previous data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE allocations;
TRUNCATE TABLE requests;
TRUNCATE TABLE facility_equipment;
TRUNCATE TABLE equipment;
TRUNCATE TABLE facilities;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Equipment
INSERT INTO equipment (id, name) VALUES
(1, 'Projector'),
(2, 'Mic'),
(3, 'AC'),
(4, 'Computers'),
(5, 'Whiteboard'),
(6, 'Live Stream');

-- 2. Insert VSB Campus Facilities (21 exact facilities from VSB layout)
INSERT INTO facilities (id, name, type, capacity, building, floor) VALUES
-- 1) MB - I
(1, 'ECE - Electrical Lab', 'Lab', 45, 'MB - I', 'Ground Floor'),
(2, 'Tech Lab', 'Lab', 70, 'MB - I', '1st Floor'),

-- 2) MB - II
(3, 'Lab 1', 'Lab', 90, 'MB - II', 'Ground Floor'),
(4, 'Lab 2', 'Lab', 80, 'MB - II', '1st Floor'),
(5, 'Lab 3', 'Lab', 70, 'MB - II', '2nd Floor'),
(6, 'Lab 4', 'Lab', 100, 'MB - II', '3rd Floor'),
(7, 'Conference Hall', 'Seminar Hall', 150, 'MB - II', '1st Floor'),
(8, 'Seminar Hall', 'Seminar Hall', 175, 'MB - II', 'Ground Floor'),

-- 3) MB - III
(9, 'Lab 5', 'Lab', 80, 'MB - III', '1st Floor'),
(10, 'Lab 6', 'Lab', 110, 'MB - III', '2nd Floor'),

-- 4) Auditorium
(11, 'VSB Main Auditorium', 'Auditorium', 1000, 'Auditorium Block', 'Ground Floor'),

-- 5) ECE Block
(12, 'ECE Lab 1', 'Lab', 250, 'ECE Block', 'Ground Floor'),

-- 6) Physics Lab
(13, 'Physics Lab', 'Lab', 50, 'Science Block', 'Ground Floor'),

-- 7) Chemistry Lab
(14, 'Chemistry Lab', 'Lab', 50, 'Science Block', '1st Floor'),

-- 8) Thermal Lab
(15, 'Thermal Lab 1', 'Lab', 300, 'Thermal Lab Block', 'Ground Floor'),
(16, 'Thermal Lab 2', 'Lab', 100, 'Thermal Lab Block', '1st Floor'),
(17, 'Thermal Lab 3', 'Lab', 75, 'Thermal Lab Block', '2nd Floor'),

-- 9) EEE Block
(18, 'EEE Circuit Lab 1', 'Lab', 60, 'EEE Block', 'Ground Floor'),
(19, 'EEE Circuit Lab 2', 'Lab', 60, 'EEE Block', '1st Floor'),

-- 10) PG Block
(20, 'PG Lab 7', 'Lab', 100, 'PG Block', '1st Floor'),
(21, 'MCA Lab', 'Lab', 100, 'PG Block', '2nd Floor');

-- 3. Map Facility Equipment
-- MB - I
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (1, 3), (1, 4), (1, 5); -- ECE Lab
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (2, 1), (2, 3), (2, 4), (2, 5); -- Tech Lab

-- MB - II
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (3, 1), (3, 3), (3, 4), (3, 5); -- Lab 1
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (4, 1), (4, 3), (4, 4), (4, 5); -- Lab 2
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (5, 1), (5, 3), (5, 4), (5, 5); -- Lab 3
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (6, 1), (6, 3), (6, 4), (6, 5), (6, 6); -- Lab 4 (with live stream)
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (7, 1), (7, 2), (7, 3), (7, 5), (7, 6); -- Conference Hall
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (8, 1), (8, 2), (8, 3), (8, 5), (8, 6); -- Seminar Hall

-- MB - III
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (9, 1), (9, 3), (9, 4), (9, 5); -- Lab 5
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (10, 1), (10, 3), (10, 4), (10, 5), (10, 6); -- Lab 6

-- Auditorium
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (11, 1), (11, 2), (11, 3), (11, 6); -- VSB Auditorium

-- ECE Block
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (12, 1), (12, 2), (12, 3), (12, 4), (12, 5); -- ECE Lab 1

-- Science Block
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (13, 1), (13, 3), (13, 5); -- Physics Lab
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (14, 1), (13, 3), (14, 5); -- Chemistry Lab

-- Thermal Lab Block
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (15, 1), (15, 2), (15, 3), (15, 5); -- Thermal Lab 1
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (16, 1), (16, 3), (16, 5); -- Thermal Lab 2
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (17, 1), (17, 3), (17, 5); -- Thermal Lab 3

-- EEE Block
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (18, 1), (18, 3), (18, 4), (18, 5); -- EEE Circuit Lab 1
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (19, 1), (19, 3), (19, 4), (19, 5); -- EEE Circuit Lab 2

-- PG Block
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (20, 1), (20, 3), (20, 4), (20, 5); -- PG Lab 7
INSERT INTO facility_equipment (facility_id, equipment_id) VALUES (21, 1), (21, 3), (21, 4), (21, 5), (21, 6); -- MCA Lab

-- 4. Seed 20 historical and upcoming allocations
INSERT INTO requests (id, event_name, event_type, student_count, start_datetime, end_datetime, facility_type, required_equipment, created_at) VALUES
(1, 'ECE Microcontroller Workshop', 'Workshop', 40, DATE_ADD(CURDATE(), INTERVAL -18 DAY) + INTERVAL 9 HOUR, DATE_ADD(CURDATE(), INTERVAL -18 DAY) + INTERVAL 12 HOUR, 'Lab', '["Computers", "AC"]', DATE_ADD(CURDATE(), INTERVAL -22 DAY)),
(2, 'VSB Grand Annual Symposium', 'Conference', 950, DATE_ADD(CURDATE(), INTERVAL -15 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURDATE(), INTERVAL -15 DAY) + INTERVAL 14 HOUR, 'Auditorium', '["Projector", "Mic", "Live Stream"]', DATE_ADD(CURDATE(), INTERVAL -20 DAY)),
(3, 'CAD Design Masterclass', 'Workshop', 65, DATE_ADD(CURDATE(), INTERVAL -12 DAY) + INTERVAL 14 HOUR, DATE_ADD(CURDATE(), INTERVAL -12 DAY) + INTERVAL 17 HOUR, 'Lab', '["Computers", "Projector"]', DATE_ADD(CURDATE(), INTERVAL -15 DAY)),
(4, 'Applied Optics Experimentation', 'Lab Session', 45, DATE_ADD(CURDATE(), INTERVAL -10 DAY) + INTERVAL 9 HOUR, DATE_ADD(CURDATE(), INTERVAL -10 DAY) + INTERVAL 12 HOUR, 'Lab', '["Projector", "Whiteboard"]', DATE_ADD(CURDATE(), INTERVAL -12 DAY)),
(5, 'Full-Stack Web Development Bootcamp', 'Workshop', 85, DATE_ADD(CURDATE(), INTERVAL -8 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURDATE(), INTERVAL -8 DAY) + INTERVAL 16 HOUR, 'Lab', '["Computers", "AC", "Projector"]', DATE_ADD(CURDATE(), INTERVAL -10 DAY)),
(6, 'Faculty Development Seminar', 'Seminar', 140, DATE_ADD(CURDATE(), INTERVAL -6 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURDATE(), INTERVAL -6 DAY) + INTERVAL 13 HOUR, 'Seminar Hall', '["Projector", "Mic", "AC"]', DATE_ADD(CURDATE(), INTERVAL -9 DAY)),
(7, 'PG Research Scholars Forum', 'Conference', 160, DATE_ADD(CURDATE(), INTERVAL -4 DAY) + INTERVAL 14 HOUR, DATE_ADD(CURDATE(), INTERVAL -4 DAY) + INTERVAL 17 HOUR, 'Seminar Hall', '["Projector", "Mic", "AC", "Live Stream"]', DATE_ADD(CURDATE(), INTERVAL -7 DAY)),
(8, 'Automotive Engine Diagnostics', 'Workshop', 90, DATE_ADD(CURDATE(), INTERVAL -3 DAY) + INTERVAL 11 HOUR, DATE_ADD(CURDATE(), INTERVAL -3 DAY) + INTERVAL 15 HOUR, 'Lab', '["Projector", "AC"]', DATE_ADD(CURDATE(), INTERVAL -5 DAY)),
(9, 'Analog Circuit Simulation Lab', 'Lab Session', 55, DATE_ADD(CURDATE(), INTERVAL -2 DAY) + INTERVAL 9 HOUR, DATE_ADD(CURDATE(), INTERVAL -2 DAY) + INTERVAL 12 HOUR, 'Lab', '["Computers", "Projector"]', DATE_ADD(CURDATE(), INTERVAL -4 DAY)),
(10, 'MCA Cloud DevOps Training', 'Workshop', 95, DATE_ADD(CURDATE(), INTERVAL -1 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURDATE(), INTERVAL -1 DAY) + INTERVAL 16 HOUR, 'Lab', '["Computers", "Projector", "Live Stream"]', DATE_ADD(CURDATE(), INTERVAL -3 DAY)),

-- Today's Allocations
(11, 'IoT & Sensor Systems Lab', 'Workshop', 42, DATE_ADD(CURDATE(), INTERVAL 0 DAY) + INTERVAL 9 HOUR, DATE_ADD(CURDATE(), INTERVAL 0 DAY) + INTERVAL 12 HOUR, 'Lab', '["Computers", "AC"]', DATE_ADD(CURDATE(), INTERVAL -2 DAY)),
(12, 'AI & Robotics Hands-on Lab', 'Workshop', 75, DATE_ADD(CURDATE(), INTERVAL 0 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURDATE(), INTERVAL 0 DAY) + INTERVAL 13 HOUR, 'Lab', '["Computers", "Projector"]', DATE_ADD(CURDATE(), INTERVAL -2 DAY)),
(13, 'Department Academic Council', 'Meeting', 130, DATE_ADD(CURDATE(), INTERVAL 0 DAY) + INTERVAL 14 HOUR, DATE_ADD(CURDATE(), INTERVAL 0 DAY) + INTERVAL 17 HOUR, 'Seminar Hall', '["Projector", "Mic", "AC"]', DATE_ADD(CURDATE(), INTERVAL -1 DAY)),
(14, 'Thermal Power Plant Simulation', 'Workshop', 70, DATE_ADD(CURDATE(), INTERVAL 0 DAY) + INTERVAL 15 HOUR, DATE_ADD(CURDATE(), INTERVAL 0 DAY) + INTERVAL 18 HOUR, 'Lab', '["Projector", "AC"]', DATE_ADD(CURDATE(), INTERVAL -1 DAY)),

-- Upcoming Allocations
(15, 'Cybersecurity Ethical Hacking Lab', 'Workshop', 95, DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 9 HOUR, DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 13 HOUR, 'Lab', '["Computers", "Projector", "AC"]', DATE_ADD(CURDATE(), INTERVAL 0 DAY)),
(16, 'VSB Induction Ceremony 2026', 'Ceremony', 900, DATE_ADD(CURDATE(), INTERVAL 3 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURDATE(), INTERVAL 3 DAY) + INTERVAL 14 HOUR, 'Auditorium', '["Projector", "Mic", "Live Stream"]', DATE_ADD(CURDATE(), INTERVAL 0 DAY)),
(17, 'Power Systems & Grid Lab', 'Workshop', 55, DATE_ADD(CURDATE(), INTERVAL 4 DAY) + INTERVAL 14 HOUR, DATE_ADD(CURDATE(), INTERVAL 4 DAY) + INTERVAL 17 HOUR, 'Lab', '["Computers", "Projector"]', DATE_ADD(CURDATE(), INTERVAL 0 DAY)),
(18, 'Data Science Capstone Defense', 'Presentation', 100, DATE_ADD(CURDATE(), INTERVAL 5 DAY) + INTERVAL 9 HOUR, DATE_ADD(CURDATE(), INTERVAL 5 DAY) + INTERVAL 13 HOUR, 'Lab', '["Computers", "Projector", "Live Stream"]', DATE_ADD(CURDATE(), INTERVAL 0 DAY)),
(19, 'International Renewable Energy Conclave', 'Conference', 165, DATE_ADD(CURDATE(), INTERVAL 7 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURDATE(), INTERVAL 7 DAY) + INTERVAL 16 HOUR, 'Seminar Hall', '["Projector", "Mic", "Live Stream", "AC"]', DATE_ADD(CURDATE(), INTERVAL 0 DAY)),
(20, 'Advanced Thermodynamics Practical', 'Lab Session', 280, DATE_ADD(CURDATE(), INTERVAL 8 DAY) + INTERVAL 11 HOUR, DATE_ADD(CURDATE(), INTERVAL 8 DAY) + INTERVAL 15 HOUR, 'Lab', '["Projector", "Mic", "AC"]', DATE_ADD(CURDATE(), INTERVAL 0 DAY));

-- 5. Insert 20 Allocations
INSERT INTO allocations (id, request_id, facility_id, start_datetime, end_datetime, status, created_at) VALUES
(1, 1, 1, DATE_ADD(CURDATE(), INTERVAL -18 DAY) + INTERVAL 9 HOUR, DATE_ADD(CURDATE(), INTERVAL -18 DAY) + INTERVAL 12 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL -22 DAY)),
(2, 2, 11, DATE_ADD(CURDATE(), INTERVAL -15 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURDATE(), INTERVAL -15 DAY) + INTERVAL 14 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL -20 DAY)),
(3, 3, 2, DATE_ADD(CURDATE(), INTERVAL -12 DAY) + INTERVAL 14 HOUR, DATE_ADD(CURDATE(), INTERVAL -12 DAY) + INTERVAL 17 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL -15 DAY)),
(4, 4, 13, DATE_ADD(CURDATE(), INTERVAL -10 DAY) + INTERVAL 9 HOUR, DATE_ADD(CURDATE(), INTERVAL -10 DAY) + INTERVAL 12 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL -12 DAY)),
(5, 5, 3, DATE_ADD(CURDATE(), INTERVAL -8 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURDATE(), INTERVAL -8 DAY) + INTERVAL 16 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL -10 DAY)),
(6, 6, 7, DATE_ADD(CURDATE(), INTERVAL -6 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURDATE(), INTERVAL -6 DAY) + INTERVAL 13 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL -9 DAY)),
(7, 7, 8, DATE_ADD(CURDATE(), INTERVAL -4 DAY) + INTERVAL 14 HOUR, DATE_ADD(CURDATE(), INTERVAL -4 DAY) + INTERVAL 17 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL -7 DAY)),
(8, 8, 16, DATE_ADD(CURDATE(), INTERVAL -3 DAY) + INTERVAL 11 HOUR, DATE_ADD(CURDATE(), INTERVAL -3 DAY) + INTERVAL 15 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL -5 DAY)),
(9, 9, 18, DATE_ADD(CURDATE(), INTERVAL -2 DAY) + INTERVAL 9 HOUR, DATE_ADD(CURDATE(), INTERVAL -2 DAY) + INTERVAL 12 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL -4 DAY)),
(10, 10, 21, DATE_ADD(CURDATE(), INTERVAL -1 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURDATE(), INTERVAL -1 DAY) + INTERVAL 16 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL -3 DAY)),

-- Today's Allocations
(11, 11, 1, DATE_ADD(CURDATE(), INTERVAL 0 DAY) + INTERVAL 9 HOUR, DATE_ADD(CURDATE(), INTERVAL 0 DAY) + INTERVAL 12 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL -2 DAY)),
(12, 12, 4, DATE_ADD(CURDATE(), INTERVAL 0 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURDATE(), INTERVAL 0 DAY) + INTERVAL 13 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL -2 DAY)),
(13, 13, 7, DATE_ADD(CURDATE(), INTERVAL 0 DAY) + INTERVAL 14 HOUR, DATE_ADD(CURDATE(), INTERVAL 0 DAY) + INTERVAL 17 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL -1 DAY)),
(14, 14, 17, DATE_ADD(CURDATE(), INTERVAL 0 DAY) + INTERVAL 15 HOUR, DATE_ADD(CURDATE(), INTERVAL 0 DAY) + INTERVAL 18 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL -1 DAY)),

-- Upcoming Allocations
(15, 15, 6, DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 9 HOUR, DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 13 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL 0 DAY)),
(16, 16, 11, DATE_ADD(CURDATE(), INTERVAL 3 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURDATE(), INTERVAL 3 DAY) + INTERVAL 14 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL 0 DAY)),
(17, 17, 19, DATE_ADD(CURDATE(), INTERVAL 4 DAY) + INTERVAL 14 HOUR, DATE_ADD(CURDATE(), INTERVAL 4 DAY) + INTERVAL 17 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL 0 DAY)),
(18, 18, 20, DATE_ADD(CURDATE(), INTERVAL 5 DAY) + INTERVAL 9 HOUR, DATE_ADD(CURDATE(), INTERVAL 5 DAY) + INTERVAL 13 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL 0 DAY)),
(19, 19, 8, DATE_ADD(CURDATE(), INTERVAL 7 DAY) + INTERVAL 10 HOUR, DATE_ADD(CURDATE(), INTERVAL 7 DAY) + INTERVAL 16 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL 0 DAY)),
(20, 20, 15, DATE_ADD(CURDATE(), INTERVAL 8 DAY) + INTERVAL 11 HOUR, DATE_ADD(CURDATE(), INTERVAL 8 DAY) + INTERVAL 15 HOUR, 'confirmed', DATE_ADD(CURDATE(), INTERVAL 0 DAY));
