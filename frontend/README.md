 # RuralCare 🚑

> A prototype of a real-time emergency routing, resource allocation, and ambulance dispatch simulation engine for rural healthcare logistics.

---------------------------------------------------------------------------------------------------------------------------------

## The Core Problem

In rural healthcare networks, reaching the physically closest clinic is often the wrong decision:

1. **Missing Specialist:** The nearest clinic might not have the required on-duty doctor (e.g., Cardiology or Trauma).
2. **Supply Depletion:** The specific emergency medicine or life-support pack may be out of stock.
3. **Capacity Saturation:** The facility may have zero available inpatient beds.

**RuralCare** evaluates the entire weighted network graph in real time to dispatch the nearest available ambulance and route the patient to the optimal qualified facility using a dual-latency objective function:

$$\text{Total Cost} = \text{Travel Time} + \text{Wait Time}$$

---------------------------------------------------------------------------------------------------------------------------------

## How It Works

* **Shortest-Path Traversal (Dijkstra):** Computes minimum-latency paths across village nodes and medical facility targets.
* **Multi-Constraint Validation:** A hospital is only qualified if all operational criteria are satisfied:
  * Required specialist is on duty.
  * Required medical pack is verified in inventory.
  * Inpatient capacity has at least 1 free bed.
* **Logarithmic Priority Queueing:** Defers and sorts unserviced requests by urgency (`Critical` $\rightarrow$ `Urgent` $\rightarrow$ `Normal`) to preserve SLA targets under resource exhaustion.
* **Dynamic Graph Re-Routing:** Evaluates topological road blockages and invalidates compromised graph edges on the fly.
* **Asynchronous Resource Recovery:** Simulates telemetry cycles where ambulances return to standby (20s) and treatment beds clear (40s).

---------------------------------------------------------------------------------------------------------------------------------

## Network Map & Topology

### Nodes & Facilities

| Node ID | Entity Name | Type | Specialists Available | Stocked Medical Supply Kits | Base Capacity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A** | Village A | Influx Node | — | — | — |
| **B** | Village B | Influx Node | — | — | — |
| **C** | Village C | Influx Node | — | — | — |
| **D** | Village D | Influx Node | — | — | — |
| **H1** | West Clinic | Clinic | General Medicine, Pediatrics | Basic Kit, Pediatric Care Pack | 4 Beds |
| **H2** | North Regional | Hospital | General, Cardiology, Orthopedics | Basic, Cardiac Care, Orthopedic Kits | 5 Beds |
| **H3** | South Trauma | Trauma Ctr | General, Trauma, Neurology | Basic, Trauma/Hemostatic, Neuro Kits | 3 Beds |

### Fleet Distribution
* **AMB-01:** Stationed at Node A
* **AMB-02:** Stationed at Node B
* **AMB-03:** Stationed at Node C
* **AMB-04:** Stationed at Node D

---------------------------------------------------------------------------------------------------------------------------------

## Edge Cases Handled

* **Specialist & Supply Mismatch:** If Node A requests Cardiology, H1 (3 km away) is bypassed because it lacks cardiologists, routing instead to H2.
* **Fleet / Bed Exhaustion:** If all ambulances or qualified beds are saturated, requests enter an active priority queue and dispatch automatically when units clear.
* **Topological Road Closures:** Interactive toggles disable bidirectional graph edges, prompting Dijkstra recalculation across alternate paths.

---------------------------------------------------------------------------------------------------------------------------------

## Testing & Verification Walkthrough

Execute these scenarios directly on the dashboard to test the routing heuristics:

### Test Case 1: Specialist & Supply Fallback (Bypassing Nearest Facility)
* **Action:** Select `Village A`, `Critical`, `Cardiologist`, `Cardiac Care Kit`. Click **Dispatch Ambulance & Route Patient**.
* **Expected Result:** Closest facility **H1** (3 km) is bypassed. The engine routes to **H2 (North Regional)** via `A ➔ B ➔ H2`. The path highlights in crimson, and the decision log outputs the full cost breakdown.

### Test Case 2: Dynamic Road Blockage Re-routing
* **Action:** Under the map panel, toggle **Toggle Road A ↔ B**, then dispatch a patient from `Village A` requiring `Cardiologist`.
* **Expected Result:** The engine flags edge `A-B` as blocked, recalculates traversal, and reroutes through `A ➔ C ➔ B ➔ H2`.

### Test Case 3: Priority SLA Queueing & Auto-Recovery
* **Action:** Dispatch concurrent requests across nodes until all 4 ambulance units indicate busy status.
* **Expected Result:** Incoming requests accumulate in the **Priority Influx Queue** sorted by urgency tier (`Critical` $\rightarrow$ `Urgent` $\rightarrow$ `Normal`). Once asynchronous recovery timers complete (20s for fleet, 40s for beds), queued requests automatically execute in priority order.

---------------------------------------------------------------------------------------------------------------------------------

## Tech Stack & Architecture

* **Frontend:** HTML5, CSS3 (CSS Grid / Flexbox / CSS Variables for Light & Dark mode), SVG for dynamic road lines and medical node icons
* **Data Structures & Algorithms:** Dijkstra Shortest Path, Priority Queue, Graph Adjacency List
* **Rendering Engine:** Responsive DOM overlays paired with dynamic inline SVG vector networks

---------------------------------------------------------------------------------------------------------------------------------

## Third-Party Libraries

* **Typography:** [Google Fonts](https://fonts.google.com/) (`Inter`, `JetBrains Mono`)
* **Icons:** Pure inline SVG vectors and [Remix Icon](https://remixicon.com/)
* **External APIs:** None. Fully client-side zero-dependency execution.

---------------------------------------------------------------------------------------------------------------------------------

## AI Tools & Development Workflow

* **ChatGPT (OpenAI):** Used for initial problem breakdown, roadmap planning, and logic scripting (including timer-based releases for occupied beds and ambulances).
* **Claude (Anthropic):** Used for UI component ideation, providing design ideas for fleet tracking badges, hospital capacity panels, and decision breadcrumbs.
* **Gemini (Google AI):** Used for map topology cleanup, semantic entity renaming, specialist-to-medicine matrix mapping, vector SVG icon refactoring, and light/dark theme implementation.