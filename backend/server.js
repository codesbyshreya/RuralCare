
const fs = require("fs");
require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10kb" }));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." }
});

app.use("/api", apiLimiter);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        ca: fs.readFileSync(
            "/home/ec2-user/ruralcare/backend/global-bundle.pem"
        ),
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 5
});

app.post("/api/requests", async (req, res) => {
    const {
        patient_name,
        contact_number,
        emergency_type,
        location,
        hospital_id,
        ambulance_id,
        request_status
    } = req.body;

    if (
        typeof patient_name !== "string" || !patient_name.trim() ||
        typeof emergency_type !== "string" || !emergency_type.trim() ||
        typeof location !== "string" || !location.trim()
    ) {
        return res.status(400).json({
            error: "Patient name, emergency type, and location are required"
        });
    }

    const assigned = request_status === "Assigned";
    const validId = value => Number.isInteger(value) && value > 0;

    if (assigned && (!validId(hospital_id) || !validId(ambulance_id))) {
        return res.status(400).json({
            error: "Valid hospital_id and ambulance_id are required for Assigned requests"
        });
    }

    try {
        if (assigned) {
            const [[hospital]] = await pool.execute(
                "SELECT hospital_id FROM hospitals WHERE hospital_id = ?",
                [hospital_id]
            );

            const [[ambulance]] = await pool.execute(
                "SELECT ambulance_id FROM ambulances WHERE ambulance_id = ?",
                [ambulance_id]
            );

            if (!hospital || !ambulance) {
                return res.status(400).json({
                    error: "Hospital or ambulance ID does not exist"
                });
            }
        }

        const status = assigned ? "Assigned" : "Pending";

        const [result] = await pool.execute(
            `INSERT INTO emergency_requests
             (patient_name, contact_number, emergency_type, location,
              hospital_id, ambulance_id, request_status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                patient_name.trim(),
                contact_number || null,
                emergency_type.trim(),
                location.trim(),
                assigned ? hospital_id : null,
                assigned ? ambulance_id : null,
                status
            ]
        );

        res.status(201).json({
            message: "Emergency request saved",
            request_id: result.insertId,
            request_status: status
        });
    } catch (error) {
        console.error("Request insert failed:", error.code);

        res.status(500).json({
            error: "Could not save emergency request"
        });
    }
});

app.get("/api/health", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS connected");

        res.json({
            status: "ok",
            database: rows[0].connected === 1
        });
    } catch (error) {
        console.error("Database connection failed:", error.code);

        res.status(503).json({
            status: "error",
            message: "Database unavailable. Check server configuration and network access."
        });
    }
});

app.get("/api/ambulances", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT ambulance_id, vehicle_number, location, status FROM ambulances"
        );

        res.json(rows);
    } catch (error) {
        console.error("Ambulance query failed:", error.code);
        res.status(500).json({
            error: "Could not retrieve ambulances"
        });
    }
});

app.get("/api/requests", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT request_id, patient_name, emergency_type, location,
                   hospital_id, ambulance_id, request_status, request_time
            FROM emergency_requests
            ORDER BY request_id DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error("Request query failed:", error.code);
        res.status(500).json({
            error: "Could not retrieve requests"
        });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log(
        `RuralCare API running on port ${process.env.PORT || 3000}`
    );
});
