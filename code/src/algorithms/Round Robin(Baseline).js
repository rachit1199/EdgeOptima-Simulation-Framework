/***********************************************************************
 * EdgeOptima - Round Robin Offloading Engine
 * ---------------------------------------------------------------
 * Strategy: Cyclic tier assignment (Baseline)
 * Order: LOCAL → EDGE → CLOUD → repeat
 ***********************************************************************/

/***********************************************************************
 * UTILITY FUNCTIONS
 ***********************************************************************/
function mbToMegabits(mb) {
    return mb * 8;
}

function transmissionTime(sizeMB, bandwidthMbps, propagationDelay) {
    const sizeMb = mbToMegabits(sizeMB);
    const seconds = sizeMb / bandwidthMbps;
    return (seconds * 1000) + propagationDelay;
}

function executionTime(mflops, cpuCapacity) {
    return (mflops / cpuCapacity) * 1000;
}

function transmissionEnergy(power, timeMs) {
    return power * (timeMs / 1000);
}

function executionEnergy(power, timeMs) {
    return power * (timeMs / 1000);
}

function objective(totalEnergy, latency, wE, wL) {
    return (wE * totalEnergy) + (wL * latency);
}

/***********************************************************************
 * COMPUTE METRICS FOR GIVEN TIER
 ***********************************************************************/
function computeMetrics(task, params, tier) {

    const {
        bwLocalEdge,
        bwEdgeCloud,
        propagationDelay,
        cloudDelay,
        localCPU,
        edgeCPU,
        cloudCPU,
        devicePower,
        localExecPower,
        edgeExecPower,
        cloudExecPower
    } = params;

    let txTime = 0;
    let txEnergy = 0;
    let execTime = 0;
    let execEnergyVal = 0;

    if (tier === "LOCAL") {

        execTime = executionTime(task.complexity, localCPU);
        execEnergyVal = executionEnergy(localExecPower, execTime);

    } else if (tier === "EDGE") {

        txTime = transmissionTime(task.size, bwLocalEdge, propagationDelay);
        txEnergy = transmissionEnergy(devicePower, txTime);

        execTime = executionTime(task.complexity, edgeCPU);
        execEnergyVal = executionEnergy(edgeExecPower, execTime);

    } else if (tier === "CLOUD") {

        const tx1 = transmissionTime(task.size, bwLocalEdge, propagationDelay);
        const tx2 = transmissionTime(task.size, bwEdgeCloud, cloudDelay);

        txTime = tx1 + tx2;
        txEnergy = transmissionEnergy(devicePower, txTime);

        execTime = executionTime(task.complexity, cloudCPU);
        execEnergyVal = executionEnergy(cloudExecPower, execTime);
    }

    const totalEnergy = txEnergy + execEnergyVal;
    const latency = txTime + execTime;

    return { totalEnergy, latency };
}

/***********************************************************************
 * ROUND ROBIN BASELINE
 ***********************************************************************/
function roundRobinOffloading(params) {

    const {
        numTasks,
        taskSize,
        taskComplexity,
        maxDeadline,
        weightEnergy
    } = params;

    const wE = weightEnergy;
    const wL = 1 - wE;

    const tiers = ["LOCAL", "EDGE", "CLOUD"];

    let totalEnergySystem = 0;
    let totalLatencySystem = 0;
    let qosMet = 0;

    const results = [];

    for (let i = 1; i <= numTasks; i++) {

        const tier = tiers[(i - 1) % 3];

        const task = {
            size: taskSize,
            complexity: taskComplexity,
            deadline: maxDeadline
        };

        const metrics = computeMetrics(task, params, tier);

        const deadlineMet = metrics.latency <= maxDeadline;
        if (deadlineMet) qosMet++;

        const objCost = objective(
            metrics.totalEnergy,
            metrics.latency,
            wE,
            wL
        );

        totalEnergySystem += metrics.totalEnergy;
        totalLatencySystem += metrics.latency;

        results.push({
            task_id: i,
            assigned_tier: tier,
            total_energy: metrics.totalEnergy,
            latency: metrics.latency,
            objective_cost: objCost,
            deadline_met: deadlineMet
        });
    }

    const averageLatency = totalLatencySystem / numTasks;
    const qosPercentage = (qosMet / numTasks) * 100;

    return {
        algorithm: "Round Robin (Baseline)",
        total_energy: totalEnergySystem,
        average_latency: averageLatency,
        qos_percentage: qosPercentage,
        tasks: results
    };
}

/***********************************************************************
 * EXPORT MODULE
 ***********************************************************************/
module.exports = {
    roundRobinOffloading
};


/***********************************************************************
 * EdgeOptima - Round Robin Offloading Engine
 * ---------------------------------------------------------------
 * Strategy: Cyclic tier assignment (Baseline)
 * Order: LOCAL → EDGE → CLOUD → repeat
 ***********************************************************************/

/***********************************************************************
 * UTILITY FUNCTIONS
 ***********************************************************************/
function mbToMegabits(mb) {
    return mb * 8;
}

function transmissionTime(sizeMB, bandwidthMbps, propagationDelay) {
    const sizeMb = mbToMegabits(sizeMB);
    const seconds = sizeMb / bandwidthMbps;
    return (seconds * 1000) + propagationDelay;
}

function executionTime(mflops, cpuCapacity) {
    return (mflops / cpuCapacity) * 1000;
}

function transmissionEnergy(power, timeMs) {
    return power * (timeMs / 1000);
}

function executionEnergy(power, timeMs) {
    return power * (timeMs / 1000);
}

function objective(totalEnergy, latency, wE, wL) {
    return (wE * totalEnergy) + (wL * latency);
}

/***********************************************************************
 * COMPUTE METRICS FOR GIVEN TIER
 ***********************************************************************/
function computeMetrics(task, params, tier) {

    const {
        bwLocalEdge,
        bwEdgeCloud,
        propagationDelay,
        cloudDelay,
        localCPU,
        edgeCPU,
        cloudCPU,
        devicePower,
        localExecPower,
        edgeExecPower,
        cloudExecPower
    } = params;

    let txTime = 0;
    let txEnergy = 0;
    let execTime = 0;
    let execEnergyVal = 0;

    if (tier === "LOCAL") {

        execTime = executionTime(task.complexity, localCPU);
        execEnergyVal = executionEnergy(localExecPower, execTime);

    } else if (tier === "EDGE") {

        txTime = transmissionTime(task.size, bwLocalEdge, propagationDelay);
        txEnergy = transmissionEnergy(devicePower, txTime);

        execTime = executionTime(task.complexity, edgeCPU);
        execEnergyVal = executionEnergy(edgeExecPower, execTime);

    } else if (tier === "CLOUD") {

        const tx1 = transmissionTime(task.size, bwLocalEdge, propagationDelay);
        const tx2 = transmissionTime(task.size, bwEdgeCloud, cloudDelay);

        txTime = tx1 + tx2;
        txEnergy = transmissionEnergy(devicePower, txTime);

        execTime = executionTime(task.complexity, cloudCPU);
        execEnergyVal = executionEnergy(cloudExecPower, execTime);
    }

    const totalEnergy = txEnergy + execEnergyVal;
    const latency = txTime + execTime;

    return { totalEnergy, latency };
}

/***********************************************************************
 * ROUND ROBIN BASELINE
 ***********************************************************************/
function roundRobinOffloading(params) {

    const {
        numTasks,
        taskSize,
        taskComplexity,
        maxDeadline,
        weightEnergy
    } = params;

    const wE = weightEnergy;
    const wL = 1 - wE;

    const tiers = ["LOCAL", "EDGE", "CLOUD"];

    let totalEnergySystem = 0;
    let totalLatencySystem = 0;
    let qosMet = 0;

    const results = [];

    for (let i = 1; i <= numTasks; i++) {

        const tier = tiers[(i - 1) % 3];

        const task = {
            size: taskSize,
            complexity: taskComplexity,
            deadline: maxDeadline
        };

        const metrics = computeMetrics(task, params, tier);

        const deadlineMet = metrics.latency <= maxDeadline;
        if (deadlineMet) qosMet++;

        const objCost = objective(
            metrics.totalEnergy,
            metrics.latency,
            wE,
            wL
        );

        totalEnergySystem += metrics.totalEnergy;
        totalLatencySystem += metrics.latency;

        results.push({
            task_id: i,
            assigned_tier: tier,
            total_energy: metrics.totalEnergy,
            latency: metrics.latency,
            objective_cost: objCost,
            deadline_met: deadlineMet
        });
    }

    const averageLatency = totalLatencySystem / numTasks;
    const qosPercentage = (qosMet / numTasks) * 100;

    return {
        algorithm: "Round Robin (Baseline)",
        total_energy: totalEnergySystem,
        average_latency: averageLatency,
        qos_percentage: qosPercentage,
        tasks: results
    };
}

/***********************************************************************
 * EXPORT MODULE
 ***********************************************************************/
module.exports = {
    roundRobinOffloading
};


/***********************************************************************
 * EdgeOptima - Round Robin Offloading Engine
 * ---------------------------------------------------------------
 * Strategy: Cyclic tier assignment (Baseline)
 * Order: LOCAL → EDGE → CLOUD → repeat
 ***********************************************************************/

/***********************************************************************
 * UTILITY FUNCTIONS
 ***********************************************************************/
function mbToMegabits(mb) {
    return mb * 8;
}

function transmissionTime(sizeMB, bandwidthMbps, propagationDelay) {
    const sizeMb = mbToMegabits(sizeMB);
    const seconds = sizeMb / bandwidthMbps;
    return (seconds * 1000) + propagationDelay;
}

function executionTime(mflops, cpuCapacity) {
    return (mflops / cpuCapacity) * 1000;
}

function transmissionEnergy(power, timeMs) {
    return power * (timeMs / 1000);
}

function executionEnergy(power, timeMs) {
    return power * (timeMs / 1000);
}

function objective(totalEnergy, latency, wE, wL) {
    return (wE * totalEnergy) + (wL * latency);
}

/***********************************************************************
 * COMPUTE METRICS FOR GIVEN TIER
 ***********************************************************************/
function computeMetrics(task, params, tier) {

    const {
        bwLocalEdge,
        bwEdgeCloud,
        propagationDelay,
        cloudDelay,
        localCPU,
        edgeCPU,
        cloudCPU,
        devicePower,
        localExecPower,
        edgeExecPower,
        cloudExecPower
    } = params;

    let txTime = 0;
    let txEnergy = 0;
    let execTime = 0;
    let execEnergyVal = 0;

    if (tier === "LOCAL") {

        execTime = executionTime(task.complexity, localCPU);
        execEnergyVal = executionEnergy(localExecPower, execTime);

    } else if (tier === "EDGE") {

        txTime = transmissionTime(task.size, bwLocalEdge, propagationDelay);
        txEnergy = transmissionEnergy(devicePower, txTime);

        execTime = executionTime(task.complexity, edgeCPU);
        execEnergyVal = executionEnergy(edgeExecPower, execTime);

    } else if (tier === "CLOUD") {

        const tx1 = transmissionTime(task.size, bwLocalEdge, propagationDelay);
        const tx2 = transmissionTime(task.size, bwEdgeCloud, cloudDelay);

        txTime = tx1 + tx2;
        txEnergy = transmissionEnergy(devicePower, txTime);

        execTime = executionTime(task.complexity, cloudCPU);
        execEnergyVal = executionEnergy(cloudExecPower, execTime);
    }

    const totalEnergy = txEnergy + execEnergyVal;
    const latency = txTime + execTime;

    return { totalEnergy, latency };
}

/***********************************************************************
 * ROUND ROBIN BASELINE
 ***********************************************************************/
function roundRobinOffloading(params) {

    const {
        numTasks,
        taskSize,
        taskComplexity,
        maxDeadline,
        weightEnergy
    } = params;

    const wE = weightEnergy;
    const wL = 1 - wE;

    const tiers = ["LOCAL", "EDGE", "CLOUD"];

    let totalEnergySystem = 0;
    let totalLatencySystem = 0;
    let qosMet = 0;

    const results = [];

    for (let i = 1; i <= numTasks; i++) {

        const tier = tiers[(i - 1) % 3];

        const task = {
            size: taskSize,
            complexity: taskComplexity,
            deadline: maxDeadline
        };

        const metrics = computeMetrics(task, params, tier);

        const deadlineMet = metrics.latency <= maxDeadline;
        if (deadlineMet) qosMet++;

        const objCost = objective(
            metrics.totalEnergy,
            metrics.latency,
            wE,
            wL
        );

        totalEnergySystem += metrics.totalEnergy;
        totalLatencySystem += metrics.latency;

        results.push({
            task_id: i,
            assigned_tier: tier,
            total_energy: metrics.totalEnergy,
            latency: metrics.latency,
            objective_cost: objCost,
            deadline_met: deadlineMet
        });
    }

    const averageLatency = totalLatencySystem / numTasks;
    const qosPercentage = (qosMet / numTasks) * 100;

    return {
        algorithm: "Round Robin (Baseline)",
        total_energy: totalEnergySystem,
        average_latency: averageLatency,
        qos_percentage: qosPercentage,
        tasks: results
    };
}

/***********************************************************************
 * EXPORT MODULE
 ***********************************************************************/
module.exports = {
    roundRobinOffloading
};