function processAtEdge(task) {

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
      execution_location: "Edge Node",
      energy_consumed: 0,
      latency_observed: 0,
      edge_utilization: 0,
      status: "Failed",
      remarks: "Invalid task parameters."
    };
  }

  /* ===============================
     STEP 2: EDGE NODE CONFIGURATION
  =============================== */
  const edgeConfig = {
    cpuCapacity: 2000,         // higher than local
    baseEnergyFactor: 0.03,    // more efficient than local
    networkLatency: 8,         // device → edge delay
    edgeLoad: 60               // current edge utilization %
  };

  /* ===============================
     STEP 3: ENERGY CALCULATION
  =============================== */
  const baseEnergy =
    task.required_power * edgeConfig.baseEnergyFactor;

  const loadFactor =
    1 + edgeConfig.edgeLoad / 200;

  const totalEnergy = baseEnergy * loadFactor;

  /* ===============================
     STEP 4: LATENCY CALCULATION
  =============================== */
  const processingTime =
    task.data_size * 0.25;

  const cpuDelay =
    task.required_power / edgeConfig.cpuCapacity * 5;

  const totalLatency =
    processingTime +
    cpuDelay +
    edgeConfig.networkLatency;

  /* ===============================
     STEP 5: EDGE UTILIZATION
  =============================== */
  const edgeUtilization = Math.min(
    100,
    (task.required_power / edgeConfig.cpuCapacity) * 100
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
      "Task successfully processed at edge node. " +
      "Balanced latency achieved with moderate energy consumption.";
  } else {
    remarks =
      "Edge processing exceeded latency threshold. " +
      "Cloud offloading may provide better performance for this task.";
  }

  /* ===============================
     STEP 8: RETURN RESULT
  =============================== */
  return {
    execution_location: "Edge Node",
    energy_consumed: parseFloat(totalEnergy.toFixed(2)),
    latency_observed: parseFloat(totalLatency.toFixed(2)),
    edge_utilization: parseFloat(edgeUtilization.toFixed(2)),
    current_edge_load: edgeConfig.edgeLoad,
    status,
    remarks
  };
}

module.exports = processAtEdge;
