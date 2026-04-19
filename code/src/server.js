const express = require("express");
const db = require("./db");
const { makeDecision, saveSimulationResult } = require("./offloadingService");

const appp = express();
app.use(express.json());

app.get("/tasks", (req, res) => {
  db.query("SELECT * FROM tasks", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.post("/process-task/:id", (req, res) => {
  const taskId = req.params.id;

  db.query("SELECT * FROM tasks WHERE id = ?", [taskId], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0)
      return res.status(404).json({ message: "Task not found" });

    const task = results[0];
    const decisionResult = makeDecision(task);

    saveSimulationResult(taskId, decisionResult);

    res.json({
      message: "Task processed successfully",
      decision: decisionResult
    });
  });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});


const express = require("express");
const db = require("./db");
const { makeDecision, saveSimulationResult } = require("./offloadingService");

const app = express();

/* =========================================
   MIDDLEWARE
========================================= */
app.use(express.json());

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

/* =========================================
   GET ALL TASKS
========================================= */
app.get("/tasks", (req, res) => {
  db.query("SELECT * FROM tasks", (err, results) => {
    if (err) {
      console.error("Error fetching tasks:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({
      count: results.length,
      tasks: results
    });
  });
});

/* =========================================
   GET SINGLE TASK
========================================= */
app.get("/tasks/:id", (req, res) => {
  const taskId = req.params.id;

  db.query("SELECT * FROM tasks WHERE id = ?", [taskId], (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length === 0)
      return res.status(404).json({ message: "Task not found" });

    res.json(results[0]);
  });
});

/* =========================================
   PROCESS TASK
========================================= */
app.post("/process-task/:id", (req, res) => {
  const taskId = req.params.id;

  db.query("SELECT * FROM tasks WHERE id = ?", [taskId], (err, results) => {

    if (err) {
      console.error("Error fetching task:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0)
      return res.status(404).json({ message: "Task not found" });

    const task = results[0];

    try {

      /* Decision Engine */
      const decisionResult = makeDecision(task);

      /* Save Simulation Result */
      saveSimulationResult(taskId, decisionResult);

      console.log("Task processed successfully:", decisionResult);

      res.json({
        message: "Task processed successfully",
        task_id: taskId,
        execution_location: decisionResult.execution_location,
        energy: decisionResult.energy_consumed,
        latency: decisionResult.latency_observed,
        status: decisionResult.status
      });

    } catch (error) {
      console.error("Processing error:", error);
      res.status(500).json({ error: "Processing failed" });
    }
  });
});

/* =========================================
   GET SIMULATION HISTORY
========================================= */
app.get("/simulation-results", (req, res) => {
  db.query("SELECT * FROM simulation_results ORDER BY created_at DESC", 
  (err, results) => {

    if (err) {
      console.error("Error fetching results:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({
      total_simulations: results.length,
      results: results
    });
  });
});

/* =========================================
   PERFORMANCE STATISTICS
========================================= */
app.get("/statistics", (req, res) => {

  const statsQuery = `
    SELECT 
      execution_location,
      COUNT(*) as total_tasks,
      AVG(energy_consumed) as avg_energy,
      AVG(latency_observed) as avg_latency
    FROM simulation_results
    GROUP BY execution_location
  `;

  db.query(statsQuery, (err, results) => {

    if (err) {
      console.error("Statistics error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({
      performance_summary: results
    });
  });
});

/* =========================================
   SERVER START
========================================= */
const PORT = 3000;

app.listen(PORT, () => {
  console.log("=====================================");
  console.log(` Server running at http://localhost:${PORT}`);
  console.log(" Edge-Cloud Offloading Backend Active ");
  console.log("=====================================");
});
