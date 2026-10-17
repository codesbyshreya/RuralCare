// 1. ROAD NETWORK
let graph = {
    A:  [ 
        { node: "B", weight: 10 }, 
        { node: "C", weight: 15 }, 
        { node: "H1", weight: 3 } 
    ],
    B:  [ 
        { node: "A", weight: 10 }, 
        { node: "C", weight: 6 },  
        { node: "H2", weight: 14 } 
    ],
    C:  [ 
        { node: "A", weight: 15 }, 
        { node: "B", weight: 6 },  
        { node: "D", weight: 10 } 
    ],
    D:  [ 
        { node: "C", weight: 10 }, 
        { node: "H3", weight: 7 } 
    ],
    H1: [ 
        { node: "A", weight: 3 } 
    ],
    H2: [ 
        { node: "B", weight: 14 } 
    ],
    H3: [ 
        { node: "D", weight: 7 } 
    ]
};

let roadEdges = [
    ["H1", "A"],
    ["A", "B"],
    ["A", "C"],
    ["B", "C"],
    ["B", "H2"],
    ["C", "D"],
    ["D", "H3"]
];

let blockedRoads = new Set();

// 2. HEALTHCARE FACILITIES
const hospitals = {
    H1: {
        id: "H1",
        name: "Hospital 1 (West Clinic)",
        specialists: ["general", "pediatrics"],
        medicines: ["basic", "pediatric"],
        beds: 4,
        totalBeds: 4
    },
    H2: {
        id: "H2",
        name: "Hospital 2 (North Regional)",
        specialists: ["general", "cardiology", "orthopedics"],
        medicines: ["basic", "cardiac", "orthopedic"],
        beds: 5,
        totalBeds: 5
    },
    H3: {
        id: "H3",
        name: "Hospital 3 (South Trauma)",
        specialists: ["general", "trauma", "neurology"],
        medicines: ["basic", "trauma", "neurological"],
        beds: 3,
        totalBeds: 3
    }
};

// 3. FLEET STATUS
const ambulances = {
    AMB1: { id: "AMB-01", location: "A", available: true, status: "Available" },
    AMB2: { id: "AMB-02", location: "B", available: true, status: "Available" },
    AMB3: { id: "AMB-03", location: "C", available: true, status: "Available" },
    AMB4: { id: "AMB-04", location: "D", available: true, status: "Available" }
};

let patientQueue = [];
let requestIdCounter = 1001;

// Specialist to Default Medicine Kit Mapping
const specialistMedicineMap = {
    cardiology: "cardiac",
    general: "basic",
    neurology: "neurological",
    orthopedics: "orthopedic",
    pediatrics: "pediatric",
    trauma: "trauma"
};

// 4. DIJKSTRA ROUTING ALGORITHM
function dijkstra(startNode) {
    const distances = {};
    const previous = {};
    const unvisited = new Set(Object.keys(graph));

    for (const node in graph) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[startNode] = 0;

    while (unvisited.size > 0) {
        let current = null;
        let smallest = Infinity;

        for (const node of unvisited) {
            if (distances[node] < smallest) {
                smallest = distances[node];
                current = node;
            }
        }

        if (current === null || distances[current] === Infinity) break;
        unvisited.delete(current);

        for (const edge of graph[current]) {
            const edgeKey = [current, edge.node].sort().join("-");
            if (blockedRoads.has(edgeKey)) continue; // Skip road closures

            const alt = distances[current] + edge.weight;
            if (alt < distances[edge.node]) {
                distances[edge.node] = alt;
                previous[edge.node] = current;
            }
        }
    }
    return { distances, previous };
}

function getPath(previous, start, destination) {
    const path = [];
    let curr = destination;
    while (curr !== null) {
        path.unshift(curr);
        if (curr === start) break;
        curr = previous[curr];
    }
    return path[0] === start ? path : [];
}

// 5. QUALIFICATION & COST MATCHING
function findQualifiedHospitals(patient) {
    return Object.values(hospitals).filter(h => 
        h.beds > 0 &&
        h.specialists.includes(patient.specialist) &&
        h.medicines.includes(patient.medicine)
    );
}

function findNearestAmbulance(patientLocation) {
    let selected = null;
    let shortest = Infinity;

    for (const id in ambulances) {
        const amb = ambulances[id];
        if (!amb.available) continue;

        const result = dijkstra(amb.location);
        const dist = result.distances[patientLocation];

        if (dist !== Infinity && dist < shortest) {
            shortest = dist;
            selected = { id: id, ref: amb, distance: dist };
        }
    }
    return selected;
}

// 6. DISPATCH & TOTAL COST ENGINE
function dispatchPatient(patient) {
    const qualified = findQualifiedHospitals(patient);
    if (qualified.length === 0) {
        return { 
            success: false, 
            reason: "hospital", 
            message: `No facility currently has on-duty '${patient.specialist}', supply pack '${patient.medicine}', and available beds.` 
        };
    }

    const patientRouting = dijkstra(patient.location);
    let targetHospital = null;
    let shortestHospDist = Infinity;

    qualified.forEach(hospital => {
        const dist = patientRouting.distances[hospital.id];
        if (dist !== Infinity && dist < shortestHospDist) {
            shortestHospDist = dist;
            targetHospital = hospital;
        }
    });

    if (!targetHospital) {
        return { success: false, reason: "route", message: "No reachable road route found to qualified medical facilities." };
    }

    const ambulanceMatch = findNearestAmbulance(patient.location);
    if (!ambulanceMatch) {
        return { success: false, reason: "ambulance", message: "All regional ambulance units are currently occupied." };
    }

    const route = getPath(patientRouting.previous, patient.location, targetHospital.id);
    if (route.length === 0) {
        return { success: false, reason: "route", message: "Path reconstruction failed." };
    }

    // Allocate resources
    ambulanceMatch.ref.available = false;
    ambulanceMatch.ref.status = `En Route (${patient.urgency.toUpperCase()})`;
    targetHospital.beds--;

    const travelTime = shortestHospDist * 1.5;
    const waitTime = ambulanceMatch.distance * 1.2;
    const totalCost = (travelTime + waitTime).toFixed(1);

    const result = {
        success: true,
        patient,
        hospital: targetHospital.id,
        hospitalName: targetHospital.name,
        hospitalDistance: shortestHospDist,
        ambulanceId: ambulanceMatch.ref.id,
        ambulanceKey: ambulanceMatch.id,
        ambulanceDistance: ambulanceMatch.distance,
        route,
        travelTime: travelTime.toFixed(1),
        waitTime: waitTime.toFixed(1),
        totalCost,
        rationale: `Selected ${targetHospital.name} because it satisfies specialist '${patient.specialist}', holds verified '${patient.medicine}' medicine kit, has ${targetHospital.beds} bed(s) remaining, and optimizes operational cost (Travel ${travelTime}m + Wait ${waitTime}m = ${totalCost}m).`
    };

    simulateResourceRecovery(ambulanceMatch.id, targetHospital.id);

    drawRoads(route);
    addDecisionLog(result);
    updateAllViews();

    return result;
}

function simulateResourceRecovery(ambKey, hospId) {
    setTimeout(() => {
        if (ambulances[ambKey]) {
            ambulances[ambKey].available = true;
            ambulances[ambKey].status = "Available";
            ambulances[ambKey].location = hospId;
            updateAllViews();
            processPendingRequests();
        }
    }, 20000);

    setTimeout(() => {
        if (hospitals[hospId]) {
            hospitals[hospId].beds++;
            updateAllViews();
            processPendingRequests();
        }
    }, 40000);
}

// 7. PRIORITY QUEUE LOGIC
function priorityValue(urgency) {
    if (urgency === "critical") return 1;
    if (urgency === "urgent") return 2;
    return 3;
}

function addPatientToQueue(patient) {
    patientQueue.push(patient);
    patientQueue.sort((a, b) => priorityValue(a.urgency) - priorityValue(b.urgency));
    updateAllViews();
}

function processPendingRequests() {
    if (patientQueue.length === 0) {
        updateAllViews();
        return;
    }

    patientQueue.sort((a, b) => priorityValue(a.urgency) - priorityValue(b.urgency));

    for (let i = 0; i < patientQueue.length; i++) {
        const patient = patientQueue[i];
        const result = dispatchPatient(patient);

        if (result.success) {
            patientQueue.splice(i, 1);
            showDispatchMessage(`[DISPATCHED] Queued Req #${patient.id} ➔ ${result.hospitalName}`, "success");
            break;
        }
    }
    updateAllViews();
}

// 8. ROAD CLOSURE
window.toggleRoadBlock = function(from, to) {
    const key = [from, to].sort().join("-");
    if (blockedRoads.has(key)) {
        blockedRoads.delete(key);
        showDispatchMessage(`[RESTORED] Road ${from} ↔ ${to} reopened.`, "normal");
    } else {
        blockedRoads.add(key);
        showDispatchMessage(`[ALERT] Road ${from} ↔ ${to} blocked. Routes updated.`, "warning");
    }
    drawRoads();
};

// 9. ROAD DRAWING
function drawRoads(highlightPath = []) {
    const svg = document.getElementById("roads");
    const map = document.getElementById("map");
    if (!svg || !map) return;

    svg.innerHTML = "";
    const mapRect = map.getBoundingClientRect();
    const isLight = document.documentElement.getAttribute("data-theme") === "light";

    roadEdges.forEach(([from, to]) => {
        const startEl = document.getElementById(from);
        const endEl = document.getElementById(to);
        if (!startEl || !endEl) return;

        const startRect = startEl.getBoundingClientRect();
        const endRect = endEl.getBoundingClientRect();

        const x1 = startRect.left - mapRect.left + startRect.width / 2;
        const y1 = startRect.top - mapRect.top + startRect.height / 2;
        const x2 = endRect.left - mapRect.left + endRect.width / 2;
        const y2 = endRect.top - mapRect.top + endRect.height / 2;

        const edgeKey = [from, to].sort().join("-");
        const isBlocked = blockedRoads.has(edgeKey);

        const fromIdx = highlightPath.indexOf(from);
        const toIdx = highlightPath.indexOf(to);
        const isRoute = fromIdx !== -1 && toIdx !== -1 && Math.abs(fromIdx - toIdx) === 1;

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);

        if (isBlocked) {
            line.setAttribute("stroke", "#f59e0b");
            line.setAttribute("stroke-width", "2.5");
            line.setAttribute("stroke-dasharray", "4 4");
        } else if (isRoute) {
            line.setAttribute("stroke", "#ef4444");
            line.setAttribute("stroke-width", "4");
            line.setAttribute("stroke-linecap", "round");
        } else {
            // Adaptive road stroke based on theme mode
            line.setAttribute("stroke", isLight ? "#94a3b8" : "#40536d");
            line.setAttribute("stroke-width", "2");
            line.setAttribute("stroke-dasharray", "4 4");
        }

        svg.appendChild(line);
    });
}

// 10. UI UPDATERS & LOGGING
function updateAllViews() {
    updateTelemetry();
    renderHospitalResources();
    renderAmbulanceResources();
    renderPendingQueue();
}

function updateTelemetry() {
    document.getElementById("waitingPatients").textContent = patientQueue.length;
    document.getElementById("criticalPatients").textContent = patientQueue.filter(p => p.urgency === "critical").length;
    document.getElementById("availableAmbulances").textContent = Object.values(ambulances).filter(a => a.available).length;
    document.getElementById("availableBeds").textContent = Object.values(hospitals).reduce((sum, h) => sum + h.beds, 0);
}

function renderHospitalResources() {
    const container = document.getElementById("hospitalStatus");
    if (!container) return;
    container.innerHTML = Object.values(hospitals).map(h => `
        <div class="resource-row">
            <div>
                <strong>${h.name}</strong><br>
                <small style="color:var(--text-muted);font-size:10px;">${h.specialists.join(", ")} | ${h.medicines.join(", ")}</small>
            </div>
            <span class="resource-badge ${h.beds === 0 ? 'busy' : ''}">${h.beds}/${h.totalBeds} Beds</span>
        </div>
    `).join("");
}

function renderAmbulanceResources() {
    const container = document.getElementById("ambulanceStatus");
    if (!container) return;
    container.innerHTML = Object.values(ambulances).map(a => `
        <div class="resource-row">
            <strong>${a.id} (Station ${a.location})</strong>
            <span class="resource-badge ${!a.available ? 'busy' : ''}">${a.status}</span>
        </div>
    `).join("");
}

function renderPendingQueue() {
    const container = document.getElementById("pendingRequestsList");
    if (!container) return;

    if (patientQueue.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 6px;">
                        <circle cx="12" cy="13" r="8"/>
                        <path d="M12 9v4l2.5 1.5"/>
                        <path d="M10 2h4"/>
                        <path d="M12 2v3"/>
                    </svg>
                    SLA Target: Priority Queue Active
                </span>
                <p>Priority queue empty. All emergency SLA targets active.</p>
            </div>`;
        return;
    }

    container.innerHTML = patientQueue.map((p, idx) => `
        <div class="queue-entry">
            <span class="priority-tag ${p.urgency}">${p.urgency}</span>
            <div><strong>#${idx + 1} Req #${p.id} (Vill. ${p.location})</strong><br><small style="color:var(--text-muted);">${p.specialist} | ${p.medicine}</small></div>
            <span style="font-size:10px;color:var(--text-muted);">${p.time}</span>
        </div>
    `).join("");
}

function addDecisionLog(result) {
    const log = document.getElementById("decisionLog");
    if (!log) return;

    const empty = log.querySelector(".empty-state");
    if (empty) empty.remove();

    const entry = document.createElement("div");
    entry.className = "decision-card-entry";
    entry.style.borderLeftColor = result.patient.urgency === "critical" ? "#ef4444" : (result.patient.urgency === "urgent" ? "#f59e0b" : "#10b981");

    entry.innerHTML = `
        <div class="decision-header">
            <strong>[${result.patient.urgency.toUpperCase()}] Req #${result.patient.id} ➔ ${result.hospitalName}</strong>
            <span class="cost-box">Cost: ${result.totalCost}m (Travel: ${result.travelTime}m + Wait: ${result.waitTime}m)</span>
        </div>
        <div class="breadcrumbs">
            Route: <span>${result.route.join(" ➔ ")}</span> | Unit: <span>${result.ambulanceId}</span> | Distance: <span>${result.hospitalDistance} km</span> | Supply Kit: <span>${result.patient.medicine}</span>
        </div>
        <div class="rationale">
            <span style="display:inline-flex; align-items:center; gap:5px; color:var(--accent-cyan); font-weight:700;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                </svg>
                Algorithmic Rationale:
            </span> 
            ${result.rationale}
        </div>
    `;
    log.prepend(entry);
}

function showDispatchMessage(msg, type = "normal") {
    const el = document.getElementById("dispatchMessage");
    if (!el) return;
    el.textContent = msg;
    el.style.color = type === "success" ? "#10b981" : (type === "warning" ? "#f59e0b" : "#94a3b8");
}

// 11. THEME SWITCHER
function updateThemeIcon(isLight) {
    const icon = document.getElementById("themeIcon");
    if (!icon) return;
    if (isLight) {
        // Moon icon for switching to Dark Mode
        icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
    } else {
        // Sun icon for switching to Light Mode
        icon.innerHTML = `
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        `;
    }
}

function initTheme() {
    const themeToggleBtn = document.getElementById("themeToggle");
    const savedTheme = localStorage.getItem("ruralcare_theme") || "dark";

    if (savedTheme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
        updateThemeIcon(true);
    } else {
        document.documentElement.removeAttribute("data-theme");
        updateThemeIcon(false);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const isCurrentlyLight = document.documentElement.getAttribute("data-theme") === "light";
            if (isCurrentlyLight) {
                document.documentElement.removeAttribute("data-theme");
                localStorage.setItem("ruralcare_theme", "dark");
                updateThemeIcon(false);
            } else {
                document.documentElement.setAttribute("data-theme", "light");
                localStorage.setItem("ruralcare_theme", "light");
                updateThemeIcon(true);
            }
            drawRoads();
        });
    }
}

// 12. INITIALIZATION & SYNC
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    drawRoads();
    updateAllViews();

    const specialistSelect = document.getElementById("specialist");
    const medicineSelect = document.getElementById("medicine");

    // Auto-sync medicine supply kit with selected specialist
    if (specialistSelect && medicineSelect) {
        specialistSelect.addEventListener("change", (e) => {
            const defaultMed = specialistMedicineMap[e.target.value];
            if (defaultMed) {
                medicineSelect.value = defaultMed;
            }
        });
    }

    document.getElementById("dispatchForm").addEventListener("submit", (e) => {
        e.preventDefault();

        const patient = {
            id: requestIdCounter++,
            location: document.getElementById("patientLocation").value,
            urgency: document.getElementById("urgency").value,
            specialist: document.getElementById("specialist").value,
            medicine: document.getElementById("medicine").value,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };

        const result = dispatchPatient(patient);
        if (result.success) {
            showDispatchMessage(`[DISPATCHED] Unit ${result.ambulanceId} assigned to Village ${patient.location} ➔ ${result.hospitalName}`, "success");
        } else {
            addPatientToQueue(patient);
            showDispatchMessage(`[QUEUED] Request placed in priority heap: ${result.message}`, "warning");
        }
    });
});

window.addEventListener("resize", drawRoads);