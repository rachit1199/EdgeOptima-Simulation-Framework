/***********************************************************************
 * EdgeOptima - Greedy Offloading Engine
 * ---------------------------------------------------------------
 * Strategy: Lowest Immediate Cost
 * Decision: For each task, choose tier with minimum objective cost
 * Tiers: 0 = Local, 1 = Edge, 2 = Cloud
 ***********************************************************************/

function mbToMegabits(mb) {
    return mb * 8;
}

/***********************************************************************
 * TRANSMISSION TIME (ms)
 ***********************************************************************/
function transmissionTime(sizeMB, bandwidthMbps, propagationDelay) {
    const sizeMb = mbToMegabits(sizeMB);
    const seconds = sizeMb / bandwidthMbps;
    return (seconds * 1000) + propagationDelay;
}

/***********************************************************************
 * EXECUTION TIME (ms)
 ***********************************************************************/
function executionTime(mflops, cpuCapacity) {
    return (mflops / cpuCapacity) * 1000;
}

/***********************************************************************
 * ENERGY CALCULATIONS
 ***********************************************************************/
function transmissionEnergy(power, timeMs) {
    return power * (timeMs / 1000);
}

function executionEnergy(power, timeMs) {
    return power * (timeMs / 1000);
}

/***********************************************************************
 * OBJECTIVE FUNCTION
 * F(x) = wE * Energy + wL * Latency
 ***********************************************************************/
function objective(totalEnergy, latency, wE, wL) {
    return (wE * totalEnergy) + (wL * latency);
}

/***********************************************************************
 * COMPUTE METRICS FOR EACH TIER
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

    const sizeMb = mbToMegabits(task.size);

    let txTime = 0;
    let txEnergy = 0;
    let execTime = 0;
    let execEnergyVal = 0;

    /******** LOCAL ********/
    if (tier === "LOCAL") {

        execTime = executionTime(task.complexity, localCPU);
        execEnergyVal = executionEnergy(localExecPower, execTime);
    }

    /******** EDGE ********/
    else if (tier === "EDGE") {

        txTime = transmissionTime(task.size, bwLocalEdge, propagationDelay);
        txEnergy = transmissionEnergy(devicePower, txTime);

        execTime = executionTime(task.complexity, edgeCPU);
        execEnergyVal = executionEnergy(edgeExecPower, execTime);
    }

    /******** CLOUD ********/
    else if (tier === "CLOUD") {

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
 * GREEDY OFFLOADING ALGORITHM
 ***********************************************************************/
function greedyOffloading(params) {

    const {
        numTasks,
        taskSize,
        taskComplexity,
        maxDeadline,
        weightEnergy
    } = params;

    const wE = weightEnergy;
    const wL = 1 - wE;

    let totalEnergySystem = 0;
    let totalLatencySystem = 0;
    let qosMet = 0;

    const results = [];

    for (let i = 1; i <= numTasks; i++) {

        const task = {
            size: taskSize,
            complexity: taskComplexity,
            deadline: maxDeadline
        };

        const tiers = ["LOCAL", "EDGE", "CLOUD"];
        let bestTier = null;
        let bestCost = Infinity;
        let bestMetrics = null;

        /*******************************************
         * CHECK ALL TIERS → PICK LOWEST COST
         *******************************************/
        for (let tier of tiers) {

            const metrics = computeMetrics(task, params, tier);

            const cost = objective(
                metrics.totalEnergy,
                metrics.latency,
                wE,
                wL
            );

            if (cost < bestCost) {
                bestCost = cost;
                bestTier = tier;
                bestMetrics = metrics;
            }
        }

        const deadlineMet = bestMetrics.latency <= maxDeadline;
        if (deadlineMet) qosMet++;

        totalEnergySystem += bestMetrics.totalEnergy;
        totalLatencySystem += bestMetrics.latency;

        results.push({
            task_id: i,
            assigned_tier: bestTier,
            total_energy: bestMetrics.totalEnergy,
            latency: bestMetrics.latency,
            objective_cost: bestCost,
            deadline_met: deadlineMet
        });
    }

    const averageLatency = totalLatencySystem / numTasks;
    const qosPercentage = (qosMet / numTasks) * 100;

    return {
        algorithm: "Greedy - Lowest Immediate Cost",
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
    greedyOffloading
};



/***********************************************************************
 * EdgeOptima - Greedy Offloading Engine
 * ---------------------------------------------------------------
 * Strategy: Lowest Immediate Cost
 * Decision: For each task, choose tier with minimum objective cost
 * Tiers: 0 = Local, 1 = Edge, 2 = Cloud
 ***********************************************************************/

function mbToMegabits(mb) {
    return mb * 8;
}

/***********************************************************************
 * TRANSMISSION TIME (ms)
 ***********************************************************************/
function transmissionTime(sizeMB, bandwidthMbps, propagationDelay) {
    const sizeMb = mbToMegabits(sizeMB);
    const seconds = sizeMb / bandwidthMbps;
    return (seconds * 1000) + propagationDelay;
}

/***********************************************************************
 * EXECUTION TIME (ms)
 ***********************************************************************/
function executionTime(mflops, cpuCapacity) {
    return (mflops / cpuCapacity) * 1000;
}

/***********************************************************************
 * ENERGY CALCULATIONS
 ***********************************************************************/
function transmissionEnergy(power, timeMs) {
    return power * (timeMs / 1000);
}

function executionEnergy(power, timeMs) {
    return power * (timeMs / 1000);
}

/***********************************************************************
 * OBJECTIVE FUNCTION
 * F(x) = wE * Energy + wL * Latency
 ***********************************************************************/
function objective(totalEnergy, latency, wE, wL) {
    return (wE * totalEnergy) + (wL * latency);
}

/***********************************************************************
 * COMPUTE METRICS FOR EACH TIER
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

    const sizeMb = mbToMegabits(task.size);

    let txTime = 0;
    let txEnergy = 0;
    let execTime = 0;
    let execEnergyVal = 0;

    /******** LOCAL ********/
    if (tier === "LOCAL") {

        execTime = executionTime(task.complexity, localCPU);
        execEnergyVal = executionEnergy(localExecPower, execTime);
    }

    /******** EDGE ********/
    else if (tier === "EDGE") {

        txTime = transmissionTime(task.size, bwLocalEdge, propagationDelay);
        txEnergy = transmissionEnergy(devicePower, txTime);

        execTime = executionTime(task.complexity, edgeCPU);
        execEnergyVal = executionEnergy(edgeExecPower, execTime);
    }

    /******** CLOUD ********/
    else if (tier === "CLOUD") {

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
 * GREEDY OFFLOADING ALGORITHM
 ***********************************************************************/
function greedyOffloading(params) {

    const {
        numTasks,
        taskSize,
        taskComplexity,
        maxDeadline,
        weightEnergy
    } = params;

    const wE = weightEnergy;
    const wL = 1 - wE;

    let totalEnergySystem = 0;
    let totalLatencySystem = 0;
    let qosMet = 0;

    const results = [];

    for (let i = 1; i <= numTasks; i++) {

        const task = {
            size: taskSize,
            complexity: taskComplexity,
            deadline: maxDeadline
        };

        const tiers = ["LOCAL", "EDGE", "CLOUD"];
        let bestTier = null;
        let bestCost = Infinity;
        let bestMetrics = null;

        /*******************************************
         * CHECK ALL TIERS → PICK LOWEST COST
         *******************************************/
        for (let tier of tiers) {

            const metrics = computeMetrics(task, params, tier);

            const cost = objective(
                metrics.totalEnergy,
                metrics.latency,
                wE,
                wL
            );

            if (cost < bestCost) {
                bestCost = cost;
                bestTier = tier;
                bestMetrics = metrics;
            }
        }

        const deadlineMet = bestMetrics.latency <= maxDeadline;
        if (deadlineMet) qosMet++;

        totalEnergySystem += bestMetrics.totalEnergy;
        totalLatencySystem += bestMetrics.latency;

        results.push({
            task_id: i,
            assigned_tier: bestTier,
            total_energy: bestMetrics.totalEnergy,
            latency: bestMetrics.latency,
            objective_cost: bestCost,
            deadline_met: deadlineMet
        });
    }

    const averageLatency = totalLatencySystem / numTasks;
    const qosPercentage = (qosMet / numTasks) * 100;

    return {
        algorithm: "Greedy - Lowest Immediate Cost",
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
    greedyOffloading
};