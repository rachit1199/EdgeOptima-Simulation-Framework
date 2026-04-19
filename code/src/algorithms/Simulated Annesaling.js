/***********************************************************************
 * EdgeOptima - Simulated Annealing Offloading Engine
 * ---------------------------------------------------------------------
 * Strategy: Metaheuristic Optimization
 * Goal: Minimize weighted Energy–Latency Objective
 * Tiers: LOCAL | EDGE | CLOUD
 *
 * Author: Rachit Yadav
 ***********************************************************************/

/***********************************************************************
 * UTILITY SECTION
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
 * COMPUTE METRICS FOR TIER
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

    } else {

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
 * INITIAL RANDOM SOLUTION
 ***********************************************************************/
function generateInitialSolution(numTasks) {
    const tiers = ["LOCAL", "EDGE", "CLOUD"];
    const solution = [];
    for (let i = 0; i < numTasks; i++) {
        const randomTier = tiers[Math.floor(Math.random() * 3)];
        solution.push(randomTier);
    }
    return solution;
}

/***********************************************************************
 * NEIGHBOR GENERATION
 ***********************************************************************/
function generateNeighbor(solution) {
    const newSolution = [...solution];
    const index = Math.floor(Math.random() * solution.length);
    const tiers = ["LOCAL", "EDGE", "CLOUD"];

    let newTier = tiers[Math.floor(Math.random() * 3)];
    newSolution[index] = newTier;

    return newSolution;
}

/***********************************************************************
 * EVALUATE SOLUTION
 ***********************************************************************/
function evaluateSolution(solution, params) {

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

    for (let i = 0; i < numTasks; i++) {

        const task = {
            size: taskSize,
            complexity: taskComplexity,
            deadline: maxDeadline
        };

        const metrics = computeMetrics(task, params, solution[i]);

        totalEnergySystem += metrics.totalEnergy;
        totalLatencySystem += metrics.latency;

        if (metrics.latency <= maxDeadline) {
            qosMet++;
        }
    }

    const avgLatency = totalLatencySystem / numTasks;
    const qosPercentage = (qosMet / numTasks) * 100;

    const cost = objective(
        totalEnergySystem,
        totalLatencySystem,
        wE,
        wL
    );

    return {
        cost,
        totalEnergySystem,
        avgLatency,
        qosPercentage
    };
}

/***********************************************************************
 * SIMULATED ANNEALING CORE
 ***********************************************************************/
function simulatedAnnealing(params) {

    const {
        numTasks,
        saTemp,
        saCooling,
        saIterations
    } = params;

    let temperature = saTemp || 1000;
    const coolingRate = saCooling || 0.95;
    const iterations = saIterations || 500;

    let currentSolution = generateInitialSolution(numTasks);
    let currentEval = evaluateSolution(currentSolution, params);

    let bestSolution = currentSolution;
    let bestEval = currentEval;

    const convergenceHistory = [];

    for (let i = 0; i < iterations; i++) {

        const neighbor = generateNeighbor(currentSolution);
        const neighborEval = evaluateSolution(neighbor, params);

        const delta = neighborEval.cost - currentEval.cost;

        /******************************************************
         * ACCEPTANCE CRITERION
         ******************************************************/
        if (delta < 0) {
            currentSolution = neighbor;
            currentEval = neighborEval;
        } else {
            const probability = Math.exp(-delta / temperature);
            if (Math.random() < probability) {
                currentSolution = neighbor;
                currentEval = neighborEval;
            }
        }

        /******************************************************
         * UPDATE BEST
         ******************************************************/
        if (currentEval.cost < bestEval.cost) {
            bestSolution = currentSolution;
            bestEval = currentEval;
        }

        convergenceHistory.push(bestEval.cost);

        temperature *= coolingRate;
    }

    return {
        algorithm: "Simulated Annealing",
        best_solution: bestSolution,
        total_energy: bestEval.totalEnergySystem,
        average_latency: bestEval.avgLatency,
        qos_percentage: bestEval.qosPercentage,
        objective_cost: bestEval.cost,
        convergence: convergenceHistory
    };
}

/***********************************************************************
 * EXPORT
 ***********************************************************************/
module.exports = {
    simulatedAnnealing
};







/***********************************************************************
 * EdgeOptima - Simulated Annealing Offloading Engine
 * ---------------------------------------------------------------------
 * Strategy: Metaheuristic Optimization
 * Goal: Minimize weighted Energy–Latency Objective
 * Tiers: LOCAL | EDGE | CLOUD
 *
 * Author: Rachit Yadav
 ***********************************************************************/

/***********************************************************************
 * UTILITY SECTION
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
 * COMPUTE METRICS FOR TIER
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

    } else {

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
 * INITIAL RANDOM SOLUTION
 ***********************************************************************/
function generateInitialSolution(numTasks) {
    const tiers = ["LOCAL", "EDGE", "CLOUD"];
    const solution = [];
    for (let i = 0; i < numTasks; i++) {
        const randomTier = tiers[Math.floor(Math.random() * 3)];
        solution.push(randomTier);
    }
    return solution;
}

/***********************************************************************
 * NEIGHBOR GENERATION
 ***********************************************************************/
function generateNeighbor(solution) {
    const newSolution = [...solution];
    const index = Math.floor(Math.random() * solution.length);
    const tiers = ["LOCAL", "EDGE", "CLOUD"];

    let newTier = tiers[Math.floor(Math.random() * 3)];
    newSolution[index] = newTier;

    return newSolution;
}

/***********************************************************************
 * EVALUATE SOLUTION
 ***********************************************************************/
function evaluateSolution(solution, params) {

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

    for (let i = 0; i < numTasks; i++) {

        const task = {
            size: taskSize,
            complexity: taskComplexity,
            deadline: maxDeadline
        };

        const metrics = computeMetrics(task, params, solution[i]);

        totalEnergySystem += metrics.totalEnergy;
        totalLatencySystem += metrics.latency;

        if (metrics.latency <= maxDeadline) {
            qosMet++;
        }
    }

    const avgLatency = totalLatencySystem / numTasks;
    const qosPercentage = (qosMet / numTasks) * 100;

    const cost = objective(
        totalEnergySystem,
        totalLatencySystem,
        wE,
        wL
    );

    return {
        cost,
        totalEnergySystem,
        avgLatency,
        qosPercentage
    };
}

/***********************************************************************
 * SIMULATED ANNEALING CORE
 ***********************************************************************/
function simulatedAnnealing(params) {

    const {
        numTasks,
        saTemp,
        saCooling,
        saIterations
    } = params;

    let temperature = saTemp || 1000;
    const coolingRate = saCooling || 0.95;
    const iterations = saIterations || 500;

    let currentSolution = generateInitialSolution(numTasks);
    let currentEval = evaluateSolution(currentSolution, params);

    let bestSolution = currentSolution;
    let bestEval = currentEval;

    const convergenceHistory = [];

    for (let i = 0; i < iterations; i++) {

        const neighbor = generateNeighbor(currentSolution);
        const neighborEval = evaluateSolution(neighbor, params);

        const delta = neighborEval.cost - currentEval.cost;

        /******************************************************
         * ACCEPTANCE CRITERION
         ******************************************************/
        if (delta < 0) {
            currentSolution = neighbor;
            currentEval = neighborEval;
        } else {
            const probability = Math.exp(-delta / temperature);
            if (Math.random() < probability) {
                currentSolution = neighbor;
                currentEval = neighborEval;
            }
        }

        /******************************************************
         * UPDATE BEST
         ******************************************************/
        if (currentEval.cost < bestEval.cost) {
            bestSolution = currentSolution;
            bestEval = currentEval;
        }

        convergenceHistory.push(bestEval.cost);

        temperature *= coolingRate;
    }

    return {
        algorithm: "Simulated Annealing",
        best_solution: bestSolution,
        total_energy: bestEval.totalEnergySystem,
        average_latency: bestEval.avgLatency,
        qos_percentage: bestEval.qosPercentage,
        objective_cost: bestEval.cost,
        convergence: convergenceHistory
    };
}

/***********************************************************************
 * EXPORT
 ***********************************************************************/
module.exports = {
    simulatedAnnealing
};