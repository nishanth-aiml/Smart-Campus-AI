const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

// VSB Campus Facility Inventory (21 Exact Facilities across 10 Blocks)
const SEED_FACILITIES = [
  // 1) MB - I
  { id: 1, name: 'ECE - Electrical Lab', type: 'Lab', capacity: 45, building: 'MB - I', floor: 'Ground Floor', equipment: ['AC', 'Computers', 'Whiteboard'] },
  { id: 2, name: 'Tech Lab', type: 'Lab', capacity: 70, building: 'MB - I', floor: '1st Floor', equipment: ['Projector', 'AC', 'Computers', 'Whiteboard'] },

  // 2) MB - II
  { id: 3, name: 'Lab 1', type: 'Lab', capacity: 90, building: 'MB - II', floor: 'Ground Floor', equipment: ['Projector', 'AC', 'Computers', 'Whiteboard'] },
  { id: 4, name: 'Lab 2', type: 'Lab', capacity: 80, building: 'MB - II', floor: '1st Floor', equipment: ['Projector', 'AC', 'Computers', 'Whiteboard'] },
  { id: 5, name: 'Lab 3', type: 'Lab', capacity: 70, building: 'MB - II', floor: '2nd Floor', equipment: ['Projector', 'AC', 'Computers', 'Whiteboard'] },
  { id: 6, name: 'Lab 4', type: 'Lab', capacity: 100, building: 'MB - II', floor: '3rd Floor', equipment: ['Projector', 'AC', 'Computers', 'Whiteboard', 'Live Stream'] },
  { id: 7, name: 'Conference Hall', type: 'Seminar Hall', capacity: 150, building: 'MB - II', floor: '1st Floor', equipment: ['Projector', 'Mic', 'AC', 'Whiteboard', 'Live Stream'] },
  { id: 8, name: 'Seminar Hall', type: 'Seminar Hall', capacity: 175, building: 'MB - II', floor: 'Ground Floor', equipment: ['Projector', 'Mic', 'AC', 'Live Stream'] },

  // 3) MB - III
  { id: 9, name: 'Lab 5', type: 'Lab', capacity: 80, building: 'MB - III', floor: '1st Floor', equipment: ['Projector', 'AC', 'Computers', 'Whiteboard'] },
  { id: 10, name: 'Lab 6', type: 'Lab', capacity: 110, building: 'MB - III', floor: '2nd Floor', equipment: ['Projector', 'AC', 'Computers', 'Whiteboard', 'Live Stream'] },

  // 4) Auditorium
  { id: 11, name: 'VSB Main Auditorium', type: 'Auditorium', capacity: 1000, building: 'Auditorium Block', floor: 'Ground Floor', equipment: ['Projector', 'Mic', 'AC', 'Live Stream'] },

  // 5) ECE Block
  { id: 12, name: 'ECE Lab 1', type: 'Lab', capacity: 250, building: 'ECE Block', floor: 'Ground Floor', equipment: ['Projector', 'Mic', 'AC', 'Computers', 'Whiteboard'] },

  // 6) Physics Lab
  { id: 13, name: 'Physics Lab', type: 'Lab', capacity: 50, building: 'Science Block', floor: 'Ground Floor', equipment: ['Projector', 'AC', 'Whiteboard'] },

  // 7) Chemistry Lab
  { id: 14, name: 'Chemistry Lab', type: 'Lab', capacity: 50, building: 'Science Block', floor: '1st Floor', equipment: ['Projector', 'AC', 'Whiteboard'] },

  // 8) Thermal Lab
  { id: 15, name: 'Thermal Lab 1', type: 'Lab', capacity: 300, building: 'Thermal Lab Block', floor: 'Ground Floor', equipment: ['Projector', 'Mic', 'AC', 'Whiteboard'] },
  { id: 16, name: 'Thermal Lab 2', type: 'Lab', capacity: 100, building: 'Thermal Lab Block', floor: '1st Floor', equipment: ['Projector', 'AC', 'Whiteboard'] },
  { id: 17, name: 'Thermal Lab 3', type: 'Lab', capacity: 75, building: 'Thermal Lab Block', floor: '2nd Floor', equipment: ['Projector', 'AC', 'Whiteboard'] },

  // 9) EEE Block
  { id: 18, name: 'EEE Circuit Lab 1', type: 'Lab', capacity: 60, building: 'EEE Block', floor: 'Ground Floor', equipment: ['Projector', 'AC', 'Computers', 'Whiteboard'] },
  { id: 19, name: 'EEE Circuit Lab 2', type: 'Lab', capacity: 60, building: 'EEE Block', floor: '1st Floor', equipment: ['Projector', 'AC', 'Computers', 'Whiteboard'] },

  // 10) PG Block
  { id: 20, name: 'PG Lab 7', type: 'Lab', capacity: 100, building: 'PG Block', floor: '1st Floor', equipment: ['Projector', 'AC', 'Computers', 'Whiteboard'] },
  { id: 21, name: 'MCA Lab', type: 'Lab', capacity: 100, building: 'PG Block', floor: '2nd Floor', equipment: ['Projector', 'AC', 'Computers', 'Whiteboard', 'Live Stream'] }
];

function generateSeedAllocations() {
  const today = new Date();
  const getISO = (daysOffset, hour) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString().slice(0, 19).replace('T', ' ');
  };

  return [
    { id: 1, request_id: 1, facility_id: 1, start_datetime: getISO(-18, 9), end_datetime: getISO(-18, 12), status: 'confirmed', created_at: getISO(-22, 10) },
    { id: 2, request_id: 2, facility_id: 11, start_datetime: getISO(-15, 10), end_datetime: getISO(-15, 14), status: 'confirmed', created_at: getISO(-20, 11) },
    { id: 3, request_id: 3, facility_id: 2, start_datetime: getISO(-12, 14), end_datetime: getISO(-12, 17), status: 'confirmed', created_at: getISO(-15, 9) },
    { id: 4, request_id: 4, facility_id: 13, start_datetime: getISO(-10, 9), end_datetime: getISO(-10, 12), status: 'confirmed', created_at: getISO(-12, 14) },
    { id: 5, request_id: 5, facility_id: 3, start_datetime: getISO(-8, 10), end_datetime: getISO(-8, 16), status: 'confirmed', created_at: getISO(-10, 8) },
    { id: 6, request_id: 6, facility_id: 7, start_datetime: getISO(-6, 10), end_datetime: getISO(-6, 13), status: 'confirmed', created_at: getISO(-9, 12) },
    { id: 7, request_id: 7, facility_id: 8, start_datetime: getISO(-4, 14), end_datetime: getISO(-4, 17), status: 'confirmed', created_at: getISO(-7, 15) },
    { id: 8, request_id: 8, facility_id: 16, start_datetime: getISO(-3, 11), end_datetime: getISO(-3, 15), status: 'confirmed', created_at: getISO(-5, 9) },
    { id: 9, request_id: 9, facility_id: 18, start_datetime: getISO(-2, 9), end_datetime: getISO(-2, 12), status: 'confirmed', created_at: getISO(-4, 16) },
    { id: 10, request_id: 10, facility_id: 21, start_datetime: getISO(-1, 10), end_datetime: getISO(-1, 16), status: 'confirmed', created_at: getISO(-3, 11) },

    // Today's allocations
    { id: 11, request_id: 11, facility_id: 1, start_datetime: getISO(0, 9), end_datetime: getISO(0, 12), status: 'confirmed', created_at: getISO(-2, 9) },
    { id: 12, request_id: 12, facility_id: 4, start_datetime: getISO(0, 10), end_datetime: getISO(0, 13), status: 'confirmed', created_at: getISO(-2, 10) },
    { id: 13, request_id: 13, facility_id: 7, start_datetime: getISO(0, 14), end_datetime: getISO(0, 17), status: 'confirmed', created_at: getISO(-1, 14) },
    { id: 14, request_id: 14, facility_id: 17, start_datetime: getISO(0, 15), end_datetime: getISO(0, 18), status: 'confirmed', created_at: getISO(-1, 15) },

    // Upcoming allocations
    { id: 15, request_id: 15, facility_id: 6, start_datetime: getISO(2, 9), end_datetime: getISO(2, 13), status: 'confirmed', created_at: getISO(0, 9) },
    { id: 16, request_id: 16, facility_id: 11, start_datetime: getISO(3, 10), end_datetime: getISO(3, 14), status: 'confirmed', created_at: getISO(0, 10) },
    { id: 17, request_id: 17, facility_id: 19, start_datetime: getISO(4, 14), end_datetime: getISO(4, 17), status: 'confirmed', created_at: getISO(0, 11) },
    { id: 18, request_id: 18, facility_id: 20, start_datetime: getISO(5, 9), end_datetime: getISO(5, 13), status: 'confirmed', created_at: getISO(0, 12) },
    { id: 19, request_id: 19, facility_id: 8, start_datetime: getISO(7, 10), end_datetime: getISO(7, 16), status: 'confirmed', created_at: getISO(0, 13) },
    { id: 20, request_id: 20, facility_id: 15, start_datetime: getISO(8, 11), end_datetime: getISO(8, 15), status: 'confirmed', created_at: getISO(0, 14) }
  ];
}

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.isUsingMock = false;
    this.mockFacilities = JSON.parse(JSON.stringify(SEED_FACILITIES));
    this.mockAllocations = generateSeedAllocations();
    this.mockRequests = [];
    this.nextAllocationId = 21;
    this.nextRequestId = 21;
  }

  async initialize() {
    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'smart_campus',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 2000
      });

      const conn = await this.pool.getConnection();
      console.log('✅ Connected to MySQL database:', process.env.DB_NAME || 'smart_campus');
      conn.release();
      this.isUsingMock = false;
    } catch (err) {
      console.warn('⚠️ MySQL not reachable (' + err.message + '). Utilizing high-performance relational memory store.');
      this.isUsingMock = true;
    }
  }

  getPool() {
    return this.pool;
  }

  isMock() {
    return this.isUsingMock;
  }

  async getAllFacilities() {
    if (!this.isUsingMock && this.pool) {
      try {
        const query = `
          SELECT f.id, f.name, f.type, f.capacity, f.building, f.floor,
                 GROUP_CONCAT(e.name) as equipment_names
          FROM facilities f
          LEFT JOIN facility_equipment fe ON f.id = fe.facility_id
          LEFT JOIN equipment e ON fe.equipment_id = e.id
          GROUP BY f.id
          ORDER BY f.id ASC
        `;
        const [rows] = await this.pool.query(query);
        return rows.map(r => ({
          ...r,
          equipment: r.equipment_names ? r.equipment_names.split(',') : []
        }));
      } catch (err) {
        console.error('MySQL query error, using fallback:', err.message);
      }
    }
    return JSON.parse(JSON.stringify(this.mockFacilities));
  }

  async getAllAllocations() {
    if (!this.isUsingMock && this.pool) {
      try {
        const query = `
          SELECT a.id, a.request_id, a.facility_id, a.start_datetime, a.end_datetime, a.status, a.created_at,
                 f.name as facility_name, f.type as facility_type, f.capacity as facility_capacity,
                 r.event_name, r.event_type, r.student_count
          FROM allocations a
          JOIN facilities f ON a.facility_id = f.id
          LEFT JOIN requests r ON a.request_id = r.id
          ORDER BY a.start_datetime DESC
        `;
        const [rows] = await this.pool.query(query);
        return rows;
      } catch (err) {
        console.error('MySQL query error, using fallback:', err.message);
      }
    }
    return this.mockAllocations.map(a => {
      const fac = this.mockFacilities.find(f => f.id === a.facility_id) || {};
      const req = this.mockRequests.find(r => r.id === a.request_id) || {};
      return {
        ...a,
        facility_name: fac.name || 'Unknown Facility',
        facility_type: fac.type || 'Lab',
        facility_capacity: fac.capacity || 0,
        event_name: req.event_name || 'VSB Campus Event',
        event_type: req.event_type || 'Event',
        student_count: req.student_count || 45
      };
    }).sort((a, b) => new Date(b.start_datetime) - new Date(a.start_datetime));
  }

  async getFacilityBookingsCount() {
    const allocations = await this.getAllAllocations();
    const countMap = {};
    for (const alloc of allocations) {
      if (alloc.status === 'confirmed') {
        countMap[alloc.facility_id] = (countMap[alloc.facility_id] || 0) + 1;
      }
    }
    return countMap;
  }

  async checkOverlap(facilityId, startDatetime, endDatetime) {
    if (!this.isUsingMock && this.pool) {
      try {
        const query = `
          SELECT id FROM allocations
          WHERE facility_id = ?
            AND status = 'confirmed'
            AND start_datetime < ?
            AND end_datetime > ?
          LIMIT 1
        `;
        const [rows] = await this.pool.query(query, [facilityId, endDatetime, startDatetime]);
        return rows.length > 0;
      } catch (err) {
        console.error('MySQL checkOverlap error, using fallback:', err.message);
      }
    }

    const startReq = new Date(startDatetime).getTime();
    const endReq = new Date(endDatetime).getTime();

    return this.mockAllocations.some(a => {
      if (a.facility_id !== facilityId || a.status !== 'confirmed') return false;
      const allocStart = new Date(a.start_datetime).getTime();
      const allocEnd = new Date(a.end_datetime).getTime();
      return allocStart < endReq && allocEnd > startReq;
    });
  }

  async createAllocationWithLock({ requestId, facilityId, startDatetime, endDatetime }) {
    if (!this.isUsingMock && this.pool) {
      const conn = await this.pool.getConnection();
      try {
        await conn.beginTransaction();

        const conflictQuery = `
          SELECT id FROM allocations
          WHERE facility_id = ?
            AND status = 'confirmed'
            AND start_datetime < ?
            AND end_datetime > ?
          FOR UPDATE
        `;
        const [conflicts] = await conn.query(conflictQuery, [facilityId, endDatetime, startDatetime]);

        if (conflicts.length > 0) {
          await conn.rollback();
          return { conflict: true };
        }

        const insertQuery = `
          INSERT INTO allocations (request_id, facility_id, start_datetime, end_datetime, status, created_at)
          VALUES (?, ?, ?, ?, 'confirmed', NOW())
        `;
        const [result] = await conn.query(insertQuery, [requestId || null, facilityId, startDatetime, endDatetime]);
        await conn.commit();

        return {
          conflict: false,
          allocation: {
            id: result.insertId,
            request_id: requestId,
            facility_id: facilityId,
            start_datetime: startDatetime,
            end_datetime: endDatetime,
            status: 'confirmed',
            created_at: new Date().toISOString()
          }
        };
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    }

    const hasConflict = await this.checkOverlap(facilityId, startDatetime, endDatetime);
    if (hasConflict) {
      return { conflict: true };
    }

    const newAlloc = {
      id: this.nextAllocationId++,
      request_id: requestId || null,
      facility_id: facilityId,
      start_datetime: startDatetime,
      end_datetime: endDatetime,
      status: 'confirmed',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    this.mockAllocations.push(newAlloc);

    return { conflict: false, allocation: newAlloc };
  }

  async saveRequest(reqData) {
    if (!this.isUsingMock && this.pool) {
      try {
        const query = `
          INSERT INTO requests (event_name, event_type, student_count, start_datetime, end_datetime, facility_type, required_equipment, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        const [result] = await this.pool.query(query, [
          reqData.event_name,
          reqData.event_type,
          reqData.student_count,
          reqData.start_datetime,
          reqData.end_datetime,
          reqData.facility_type,
          JSON.stringify(reqData.required_equipment || [])
        ]);
        return { id: result.insertId, ...reqData };
      } catch (err) {
        console.error('MySQL saveRequest error:', err.message);
      }
    }

    const saved = {
      id: this.nextRequestId++,
      ...reqData,
      created_at: new Date().toISOString()
    };
    this.mockRequests.push(saved);
    return saved;
  }
}

const db = new DatabaseManager();
module.exports = db;
