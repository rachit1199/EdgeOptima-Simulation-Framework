function processAtCloud(task) {

  /* ===============================
     STEP 1: VALIDATION
  =============================== */
  if (!task) {
    throw new Error("Task object is missing.");
  }

  if (
    typeof task.required_power !== "number" ||
    typeof task.data_size !== "number" ||
    typeof task.latency_requirement !== "number"
  ) {
    return {
      execution_location: "Cloud Server",
      energy_consumed: 0,
      latency_observed: 0,
      cloud_utilization: 0,
      status: "Failed",
      remarks: "Invalid task parameters."
    };
  }

  /* ===============================
     STEP 2: CLOUD CONFIGURATION
  =============================== */
  const cloudConfig = {
    cpuCapacity: 8000,          // very high compute power
    baseEnergyFactor: 0.02,     // energy efficient per unit
    networkLatency: 25,         // device → cloud delay
    backboneDelay: 15,          // internet backbone delay
    cloudLoad: 70               // current cloud utilization %
  };

  /* ===============================
     STEP 3: ENERGY CALCULATION
  =============================== */
  const baseEnergy =
    task.required_power * cloudConfig.baseEnergyFactor;

  const loadFactor =
    1 + cloudConfig.cloudLoad / 300;

  const totalEnergy = baseEnergy * loadFactor;

  /* ===============================
     STEP 4: LATENCY CALCULATION
  =============================== */
  const processingTime =
    task.data_size * 0.15;   // fast processing

  const cpuDelay =
    task.required_power / cloudConfig.cpuCapacity * 3;

  const totalLatency =
    processingTime +
    cpuDelay +
    cloudConfig.networkLatency +
    cloudConfig.backboneDelay;

  /* ===============================
     STEP 5: CLOUD UTILIZATION
  =============================== */
  const cloudUtilization = Math.min(
    100,
    (task.required_power / cloudConfig.cpuCapacity) * 100
  );

  /* ===============================
     STEP 6: SLA CHECK
  =============================== */
  const status =
    totalLatency <= task.latency_requirement
      ? "Success"
      : "Failed";

  /* ===============================
     STEP 7: REMARKS GENERATION
  =============================== */
  let remarks;

  if (status === "Success") {
    remarks =
      "Task executed in cloud with high computational efficiency. " +
      "Suitable for large-scale or AI-intensive workloads.";
  } else {
    remarks =
      "Cloud execution exceeded latency requirement due to network overhead. " +
      "Edge processing may be more appropriate for real-time tasks.";
  }

  /* ===============================
     STEP 8: RETURN RESULT
  =============================== */
  return {
    execution_location: "Cloud Server",
    energy_consumed: parseFloat(totalEnergy.toFixed(2)),
    latency_observed: parseFloat(totalLatency.toFixed(2)),
    cloud_utilization: parseFloat(cloudUtilization.toFixed(2)),
    current_cloud_load: cloudConfig.cloudLoad,
    status,
    remarks
  };
}

module.exports = processAtCloud;
