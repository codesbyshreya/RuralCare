USE ruralcare;

-- Check that all five tables exist
SHOW TABLES;

-- Check sample record counts
SELECT 'ambulances' AS table_name, COUNT(*) AS total
FROM ambulances
UNION ALL
SELECT 'hospitals', COUNT(*) FROM hospitals
UNION ALL
SELECT 'roads', COUNT(*) FROM roads
UNION ALL
SELECT 'medicines', COUNT(*) FROM medicines
UNION ALL
SELECT 'emergency_requests', COUNT(*) FROM emergency_requests;

-- Check ambulance records
SELECT ambulance_id, vehicle_number, status
FROM ambulances;

-- Check emergency request relationships
SELECT request_id, hospital_id, ambulance_id, request_status
FROM emergency_requests;