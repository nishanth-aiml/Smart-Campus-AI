-- Smart Campus Database Schema
-- MySQL compatible

CREATE DATABASE IF NOT EXISTS smart_campus;
USE smart_campus;

-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS allocations;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS facility_equipment;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS facilities;

-- 1. Facilities Table
CREATE TABLE facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('Classroom', 'Lab', 'Auditorium', 'Sports Ground', 'Seminar Hall') NOT NULL,
    capacity INT NOT NULL,
    building VARCHAR(255) NOT NULL,
    floor VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Equipment Table
CREATE TABLE equipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Facility Equipment Junction Table
CREATE TABLE facility_equipment (
    facility_id INT NOT NULL,
    equipment_id INT NOT NULL,
    PRIMARY KEY (facility_id, equipment_id),
    CONSTRAINT fk_fe_facility FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
    CONSTRAINT fk_fe_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Requests Table
CREATE TABLE requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    student_count INT NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    facility_type ENUM('Classroom', 'Lab', 'Auditorium', 'Sports Ground', 'Seminar Hall') NOT NULL,
    required_equipment JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Allocations Table
CREATE TABLE allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NULL,
    facility_id INT NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    status ENUM('confirmed', 'cancelled') NOT NULL DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alloc_request FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE SET NULL,
    CONSTRAINT fk_alloc_facility FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
    INDEX idx_facility_time (facility_id, start_datetime, end_datetime, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
