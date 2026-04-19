/********************************************************************
 * EdgeOptima - Cloud Execution Only Simulation Engine
 * 
 * This module simulates complete cloud-only task execution
 * for Energy-Efficient Task Offloading in Edge–Cloud Environments.
 *
 * Author: Rachit Yadav
 * Mode: Cloud Only
 ********************************************************************/

const express = require("express");
const mysql = require("mysql2");
const router = express.Router();

/********************************************************************
 * DATABASE CONNECTION
 ********************************************************************/

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "your_password",
    database: "edge_cloud_offloading"
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL database.");
    }
});

/********************************************************************
 * UTILITY FUNCTIONS
 ********************************************************************/

/**
 * Convert MB to Megabits
 */
function convertMBtoMegabits(sizeMB) {
    return sizeMB * 8;
}

/**
 * Transmission Time (ms)
 * Formula:
 *  Tx Time = (Data Size / Bandwidth) + Propagation Delay
 */
function calculateTransmissionTime(sizeMB, bandwidthMbps, propagationDelay) {
    const sizeMb = convertMBtoMegabits(sizeMB);
    const txTimeSeconds = sizeMb / bandwidthMbps;
    return (txTimeSeconds * 1000) + propagationDelay;
}

/**
 * Execution Time (ms)
 * Formula:
 *  Execution Time = MFLOPS / CPU Capacity
 */
function calculateExecutionTime(taskComplexity, cloudCPU) {
    const execSeconds = taskComplexity / cloudCPU;
    return execSeconds * 1000;
}

/**
 * Transmission Energy (Joules)
 * Formula:
 *  E_tx = P_tx * time
 */
function calculateTransmissionEnergy(powerTx, txTimeMs) {
    return powerTx * (txTimeMs / 1000);
}

/**
 * Execution Energy (Joules)
 * Formula:
 *  E_exec = P_exec * time
 */
function calculateExecutionEnergy(powerExec, execTimeMs) {
    return powerExec * (execTimeMs / 1000);
}

/**
 * Objective Score
 * F(x) = wE * Energy + wL * Latency
 */
function calculateObjectiveScore(totalEnergy, latency, wE, wL) {
    return (wE * (totalEnergy / 100)) + (wL * (latency / 1000));
}

/********************************************************************
 * CLOUD ONLY SIMULATION ROUTE
 ********************************************************************/

router.post("/simulate/cloud-only", async (req, res) => {

    try {

        const {
            numTasks,
            taskSize,
            taskComplexity,
            maxDeadline,
            bwLocalEdge,
            bwEdgeCloud,
            propagationDelay,
            cloudDelay,
            devicePower,
            cloudExecPower,
            cloudCPU,
            weightEnergy
        } = req.body;

        const wE = parseFloat(weightEnergy);
        const wL = 1 - wE;

        let totalSystemEnergy = 0;
        let totalLatency = 0;
        let qosMet = 0;

        const results = [];

        for (let i = 1; i <= numTasks; i++) {

            /***********************
             * TRANSMISSION (2 hops)
             ***********************/
            const txTimeLE = calculateTransmissionTime(
                taskSize,
                bwLocalEdge,
                propagationDelay
            );

            const txTimeEC = calculateTransmissionTime(
                taskSize,
                bwEdgeCloud,
                cloudDelay
            );

            const totalTxTime = txTimeLE + txTimeEC;

            const txEnergy = calculateTransmissionEnergy(
                devicePower,
                totalTxTime
            );

            /***********************
             * EXECUTION (Cloud)
             ***********************/
            const execTime = calculateExecutionTime(
                taskComplexity,
                cloudCPU
            );

            const execEnergy = calculateExecutionEnergy(
                cloudExecPower,
                execTime
            );

            const totalEnergy = txEnergy + execEnergy;
            const totalTime = totalTxTime + execTime;

            const deadlineMet = totalTime <= maxDeadline;
            if (deadlineMet) qosMet++;

            const objective = calculateObjectiveScore(
                totalEnergy,
                totalTime,
                wE,
                wL
            );

            totalSystemEnergy += totalEnergy;
            totalLatency += totalTime;

            results.push({
                task_id: i,
                execution_place: "CLOUD",
                tx_energy: txEnergy,
                exec_energy: execEnergy,
                total_energy: totalEnergy,
                latency: totalTime,
                deadline: maxDeadline,
                deadline_met: deadlineMet,
                objective_score: objective
            });

            /***********************
             * STORE IN DATABASE
             ***********************/
            await new Promise((resolve, reject) => {

                db.query(
                    `INSERT INTO offloading_decisions 
                    (task_id, execution_place, energy_consumed, latency, decision_algorithm)
                    VALUES (?, ?, ?, ?, ?)`,
                    [
                        i,
                        "CLOUD",
                        totalEnergy,
                        totalTime,
                        "Cloud Only"
                    ],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );

            });

        }

        const averageLatency = totalLatency / numTasks;
        const qosPercentage = (qosMet / numTasks) * 100;
        const objectiveScore = calculateObjectiveScore(
            totalSystemEnergy,
            totalLatency,
            wE,
            wL
        );

        /***********************
         * STORE SIMULATION SUMMARY
         ***********************/
        db.query(
            `INSERT INTO simulation_results
            (total_tasks, total_energy, average_latency, algorithm_used, remarks)
            VALUES (?, ?, ?, ?, ?)`,
            [
                numTasks,
                totalSystemEnergy,
                averageLatency,
                "Cloud Only",
                "All tasks executed in Cloud Tier"
            ]
        );

        res.json({
            algorithm: "Cloud Only",
            total_energy: totalSystemEnergy,
            average_latency: averageLatency,
            qos_percentage: qosPercentage,
            objective_score: objectiveScore,
            task_results: results
        });

    } catch (error) {
        console.error("Simulation error:", error);
        res.status(500).json({ error: "Simulation failed" });
    }

});

/********************************************************************
 * EXPORT ROUTER
 ********************************************************************/
module.exports = router;

/***********************************************************************
 * EdgeOptima - Cloud Execution Only Simulation Engine
 * ---------------------------------------------------------------------
 * Project: Energy-Efficient Task Offloading in Edge–Cloud Environments
 * Mode   : Cloud Only
 * Author : Rachit Yadav
 * ---------------------------------------------------------------------
 * Description:
 * This module simulates full Cloud execution of computational tasks.
 * All tasks are offloaded to cloud servers via edge.
 * Includes:
 *  - Transmission modeling (2-hop)
 *  - Execution modeling
 *  - Energy calculation
 *  - Latency calculation
 *  - QoS validation
 *  - Objective function evaluation
 *  - Database persistence
 ***********************************************************************/

const express = require("express");
const mysql = require("mysql2");
const router = express.Router();

/***********************************************************************
 * DATABASE CONFIGURATION
 ***********************************************************************/
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "your_password",
    database: "edge_cloud_offloading"
});

db.connect((err) => {
    if (err) {
        console.error("❌ DB Connection Error:", err);
    } else {
        console.log("✅ Connected to MySQL");
    }
});

/***********************************************************************
 * MATHEMATICAL MODELS
 ***********************************************************************/

/* Convert MB → Megabits */
function mbToMegabits(mb) {
    return mb * 8;
}

/* Transmission Time (ms) */
function transmissionTime(sizeMB, bandwidthMbps, propagationDelay) {
    const sizeMb = mbToMegabits(sizeMB);
    const timeSeconds = sizeMb / bandwidthMbps;
    return (timeSeconds * 1000) + propagationDelay;
}

/* Execution Time (ms) */
function executionTime(mflops, cpuCapacity) {
    const seconds = mflops / cpuCapacity;
    return seconds * 1000;
}

/* Transmission Energy */
function transmissionEnergy(power, timeMs) {
    return power * (timeMs / 1000);
}

/* Execution Energy */
function executionEnergy(power, timeMs) {
    return power * (timeMs / 1000);
}

/* Objective Function */
function objective(totalEnergy, latency, wE, wL) {
    return (wE * (totalEnergy / 100)) + (wL * (latency / 1000));
}

/***********************************************************************
 * CLOUD EXECUTION CORE ENGINE
 ***********************************************************************/
function simulateCloudOnly(params) {

    const {
        numTasks,
        taskSize,
        taskComplexity,
        maxDeadline,
        bwLocalEdge,
        bwEdgeCloud,
        propagationDelay,
        cloudDelay,
        devicePower,
        cloudExecPower,
        cloudCPU,
        weightEnergy
    } = params;

    const wE = parseFloat(weightEnergy);
    const wL = 1 - wE;

    let totalEnergySystem = 0;
    let totalLatencySystem = 0;
    let qosMet = 0;

    const taskResults = [];

    for (let i = 1; i <= numTasks; i++) {

        /*********************
         * TRANSMISSION MODEL
         *********************/
        const txTimeLE = transmissionTime(
            taskSize,
            bwLocalEdge,
            propagationDelay
        );

        const txTimeEC = transmissionTime(
            taskSize,
            bwEdgeCloud,
            cloudDelay
        );

        const totalTxTime = txTimeLE + txTimeEC;

        const txEnergy = transmissionEnergy(
            devicePower,
            totalTxTime
        );

        /*********************
         * CLOUD EXECUTION
         *********************/
        const execTime = executionTime(
            taskComplexity,
            cloudCPU
        );

        const execEnergyVal = executionEnergy(
            cloudExecPower,
            execTime
        );

        const totalEnergy = txEnergy + execEnergyVal;
        const totalLatency = totalTxTime + execTime;

        const deadlineMet = totalLatency <= maxDeadline;

        if (deadlineMet) qosMet++;

        const objScore = objective(
            totalEnergy,
            totalLatency,
            wE,
            wL
        );

        totalEnergySystem += totalEnergy;
        totalLatencySystem += totalLatency;

        taskResults.push({
            task_id: i,
            tx_time: totalTxTime,
            exec_time: execTime,
            tx_energy: txEnergy,
            exec_energy: execEnergyVal,
            total_energy: totalEnergy,
            latency: totalLatency,
            deadline: maxDeadline,
            deadline_met: deadlineMet,
            objective_score: objScore
        });
    }

    const avgLatency = totalLatencySystem / numTasks;
    const qosPercentage = (qosMet / numTasks) * 100;
    const totalObjective = objective(
        totalEnergySystem,
        totalLatencySystem,
        wE,
        wL
    );

    return {
        totalEnergySystem,
        avgLatency,
        qosPercentage,
        totalObjective,
        taskResults
    };
}

/***********************************************************************
 * DATABASE STORAGE
 ***********************************************************************/
function storeTaskResult(task) {
    return new Promise((resolve, reject) => {

        db.query(
            `INSERT INTO offloading_decisions 
            (task_id, execution_place, energy_consumed, latency, decision_algorithm)
            VALUES (?, ?, ?, ?, ?)`,
            [
                task.task_id,
                "CLOUD",
                task.total_energy,
                task.latency,
                "Cloud Only"
            ],
            (err) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

function storeSimulationSummary(numTasks, totalEnergy, avgLatency) {
    db.query(
        `INSERT INTO simulation_results
        (total_tasks, total_energy, average_latency, algorithm_used, remarks)
        VALUES (?, ?, ?, ?, ?)`,
        [
            numTasks,
            totalEnergy,
            avgLatency,
            "Cloud Only",
            "Cloud-only execution scenario"
        ]
    );
}

/***********************************************************************
 * API ROUTE
 ***********************************************************************/
router.post("/simulate/cloud-only", async (req, res) => {

    try {

        const params = req.body;

        const result = simulateCloudOnly(params);

        /* Store all tasks */
        for (let task of result.taskResults) {
            await storeTaskResult(task);
        }

        /* Store summary */
        storeSimulationSummary(
            params.numTasks,
            result.totalEnergySystem,
            result.avgLatency
        );

        res.json({
            algorithm: "Cloud Only",
            total_energy: result.totalEnergySystem,
            average_latency: result.avgLatency,
            qos_percentage: result.qosPercentage,
            objective_score: result.totalObjective,
            tasks: result.taskResults
        });

    } catch (err) {
        console.error("Simulation Error:", err);
        res.status(500).json({ error: "Cloud simulation failed" });
    }
});

/***********************************************************************
 * EXTRA ANALYTICS FUNCTIONS
 ***********************************************************************/
function calculateEnergySavings(localEnergy, cloudEnergy) {
    if (localEnergy === 0) return 0;
    return ((localEnergy - cloudEnergy) / localEnergy) * 100;
}

function estimateLocalBaseline(params) {
    const { numTasks, taskComplexity, localCPU, localExecPower } = params;

    let energy = 0;

    for (let i = 0; i < numTasks; i++) {
        const execMs = executionTime(taskComplexity, localCPU);
        energy += executionEnergy(localExecPower, execMs);
    }

    return energy;
}

/***********************************************************************
 * EXPORT ROUTER
 ***********************************************************************/
module.exports = router;

/***********************************************************************
 * SERVER USAGE EXAMPLE
 *
 * const express = require("express");
 * const app = express();
 * app.use(express.json());
 * app.use("/api", require("./cloudOnlyEngine"));
 * app.listen(3000);
 *
 ***********************************************************************/