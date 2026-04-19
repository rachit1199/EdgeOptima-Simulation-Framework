function processLocally(task) {

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
      execution_location: "Local Device",
      energy_consumed: 0,
      latency_observed: 0,
      cpu_utilization: 0,
      status: "Failed",
      remarks: "Invalid task parameters."
    };
  }

  /* ===============================
     STEP 2: DEVICE CONFIGURATION
  =============================== */
  const deviceConfig = {
    cpuCapacity: 500,          // maximum local CPU capacity
    batteryLevel: 80,          // current battery %
    baseEnergyFactor: 0.05,    // energy multiplier
    networkOverhead: 3         // small local delay
  };

  /* ===============================
     STEP 3: ENERGY CALCULATION
  =============================== */
  const energyBase = task.required_power * deviceConfig.baseEnergyFactor;

  const batteryFactor =
    1 + (100 - deviceConfig.batteryLevel) / 250;

  const totalEnergy = energyBase * batteryFactor;

  /* ===============================
     STEP 4: LATENCY CALCULATION
  =============================== */
  const processingDelay = task.data_size * 0.35;

  const cpuLoadFactor =
    task.required_power / deviceConfig.cpuCapacity;

  const latency =
    processingDelay +
    cpuLoadFactor * 10 +
    deviceConfig.networkOverhead;

  /* ===============================
     STEP 5: CPU UTILIZATION
  =============================== */
  const cpuUtilization = Math.min(
    100,
    (task.required_power / deviceConfig.cpuCapacity) * 100
  );

  /* ===============================
     STEP 6: SLA CHECK
  =============================== */
  const status =
    latency <= task.latency_requirement
      ? "Success"
      : "Failed";

  /* ===============================
     STEP 7: REMARKS GENERATION
  =============================== */
  let remarks;

  if (status === "Success") {
    remarks =
      "Task executed locally with acceptable latency. " +
      "CPU utilization within safe limits and battery impact controlled.";
  } else {
    remarks =
      "Local execution exceeded latency requirement. " +
      "Edge or Cloud offloading is recommended for this workload.";
  }

  /* ===============================
     STEP 8: RETURN RESULT
  =============================== */
  return {
    execution_location: "Local Device",
    energy_consumed: parseFloat(totalEnergy.toFixed(2)),
    latency_observed: parseFloat(latency.toFixed(2)),
    cpu_utilization: parseFloat(cpuUtilization.toFixed(2)),
    battery_level: deviceConfig.batteryLevel,
    status,
    remarks
  };
}

module.exports = processLocally;
