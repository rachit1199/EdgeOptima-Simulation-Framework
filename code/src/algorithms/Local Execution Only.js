/***********************************************************************
 * EdgeOptima - Local Execution Only Engine
 * ---------------------------------------------------------------
 * Strategy: Execute all tasks locally on device
 * No offloading to Edge or Cloud
 ***********************************************************************/

/***********************************************************************
 * EXECUTION TIME (ms)
 ***********************************************************************/
function executionTime(mflops, cpuCapacity) {
    return (mflops / cpuCapacity) * 1000;
}

/***********************************************************************
 * EXECUTION ENERGY (Joules)
 ***********************************************************************/
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
 * LOCAL EXECUTION ONLY ALGORITHM
 ***********************************************************************/
function localExecutionOnly(params) {

    const {
        numTasks,
        taskSize,          // not used for transmission
        taskComplexity,
        maxDeadline,
        localCPU,
        localExecPower,
        weightEnergy
    } = params;

    const wE = weightEnergy;
    const wL = 1 - wE;

    let totalEnergySystem = 0;
    let totalLatencySystem = 0;
    let qosMet = 0;

    const results = [];

    for (let i = 1; i <= numTasks; i++) {

        /*************************************
         * LOCAL EXECUTION CALCULATION
         *************************************/
        const execTime = executionTime(
            taskComplexity,
            localCPU
        );

        const execEnergyVal = executionEnergy(
            localExecPower,
            execTime
        );

        const latency = execTime;
        const totalEnergy = execEnergyVal;

        const deadlineMet = latency <= maxDeadline;
        if (deadlineMet) qosMet++;

        const objCost = objective(
            totalEnergy,
            latency,
            wE,
            wL
        );

        totalEnergySystem += totalEnergy;
        totalLatencySystem += latency;

        results.push({
            task_id: i,
            assigned_tier: "LOCAL",
            execution_time_ms: execTime,
            energy_consumed: totalEnergy,
            latency_ms: latency,
            objective_cost: objCost,
            deadline_met: deadlineMet
        });
    }

    const averageLatency = totalLatencySystem / numTasks;
    const qosPercentage = (qosMet / numTasks) * 100;

    return {
        algorithm: "Local Execution Only",
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
    localExecutionOnly
};


/***********************************************************************
 * EdgeOptima - Local Execution Only Engine
 * ---------------------------------------------------------------
 * Strategy: Execute all tasks locally on device
 * No offloading to Edge or Cloud
 ***********************************************************************/

/***********************************************************************
 * EXECUTION TIME (ms)
 ***********************************************************************/
function executionTime(mflops, cpuCapacity) {
    return (mflops / cpuCapacity) * 1000;
}

/***********************************************************************
 * EXECUTION ENERGY (Joules)
 ***********************************************************************/
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
 * LOCAL EXECUTION ONLY ALGORITHM
 ***********************************************************************/
function localExecutionOnly(params) {

    const {
        numTasks,
        taskSize,          // not used for transmission
        taskComplexity,
        maxDeadline,
        localCPU,
        localExecPower,
        weightEnergy
    } = params;

    const wE = weightEnergy;
    const wL = 1 - wE;

    let totalEnergySystem = 0;
    let totalLatencySystem = 0;
    let qosMet = 0;

    const results = [];

    for (let i = 1; i <= numTasks; i++) {

        /*************************************
         * LOCAL EXECUTION CALCULATION
         *************************************/
        const execTime = executionTime(
            taskComplexity,
            localCPU
        );

        const execEnergyVal = executionEnergy(
            localExecPower,
            execTime
        );

        const latency = execTime;
        const totalEnergy = execEnergyVal;

        const deadlineMet = latency <= maxDeadline;
        if (deadlineMet) qosMet++;

        const objCost = objective(
            totalEnergy,
            latency,
            wE,
            wL
        );

        totalEnergySystem += totalEnergy;
        totalLatencySystem += latency;

        results.push({
            task_id: i,
            assigned_tier: "LOCAL",
            execution_time_ms: execTime,
            energy_consumed: totalEnergy,
            latency_ms: latency,
            objective_cost: objCost,
            deadline_met: deadlineMet
        });
    }

    const averageLatency = totalLatencySystem / numTasks;
    const qosPercentage = (qosMet / numTasks) * 100;

    return {
        algorithm: "Local Execution Only",
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
    localExecutionOnly
};


/***********************************************************************
 * EdgeOptima - Local Execution Only Engine
 * ---------------------------------------------------------------
 * Strategy: Execute all tasks locally on device
 * No offloading to Edge or Cloud
 ***********************************************************************/

/***********************************************************************
 * EXECUTION TIME (ms)
 ***********************************************************************/
function executionTime(mflops, cpuCapacity) {
    return (mflops / cpuCapacity) * 1000;
}

/***********************************************************************
 * EXECUTION ENERGY (Joules)
 ***********************************************************************/
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
 * LOCAL EXECUTION ONLY ALGORITHM
 ***********************************************************************/
function localExecutionOnly(params) {

    const {
        numTasks,
        taskSize,          // not used for transmission
        taskComplexity,
        maxDeadline,
        localCPU,
        localExecPower,
        weightEnergy
    } = params;

    const wE = weightEnergy;
    const wL = 1 - wE;

    let totalEnergySystem = 0;
    let totalLatencySystem = 0;
    let qosMet = 0;

    const results = [];

    for (let i = 1; i <= numTasks; i++) {

        /*************************************
         * LOCAL EXECUTION CALCULATION
         *************************************/
        const execTime = executionTime(
            taskComplexity,
            localCPU
        );

        const execEnergyVal = executionEnergy(
            localExecPower,
            execTime
        );

        const latency = execTime;
        const totalEnergy = execEnergyVal;

        const deadlineMet = latency <= maxDeadline;
        if (deadlineMet) qosMet++;

        const objCost = objective(
            totalEnergy,
            latency,
            wE,
            wL
        );

        totalEnergySystem += totalEnergy;
        totalLatencySystem += latency;

        results.push({
            task_id: i,
            assigned_tier: "LOCAL",
            execution_time_ms: execTime,
            energy_consumed: totalEnergy,
            latency_ms: latency,
            objective_cost: objCost,
            deadline_met: deadlineMet
        });
    }

    const averageLatency = totalLatencySystem / numTasks;
    const qosPercentage = (qosMet / numTasks) * 100;

    return {
        algorithm: "Local Execution Only",
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
    localExecutionOnly
};