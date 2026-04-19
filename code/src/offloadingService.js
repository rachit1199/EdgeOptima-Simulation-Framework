const db = require("./db");

function processLocally(task) {
  const energy = task.required_power * 0.05;
  const latency = task.data_size * 0.4;

  return {
    execution_location: "Local Device",
    energy_consumed: energy,
    latency_observed: latency,
    status: latency <= task.latency_requirement ? "Success" : "Failed",
    remarks: "Processed locally due to low computation requirement."
  };
}

function processAtEdge(task) {
  const energy = task.required_power * 0.03;
  const latency = task.data_size * 0.25;

  return {
    execution_location: "Edge Node",
    energy_consumed: energy,
    latency_observed: latency,
    status: latency <= task.latency_requirement ? "Success" : "Failed",
    remarks: "Processed at edge node for balanced performance."
  };
}

function processAtCloud(task) {
  const energy = task.required_power * 0.02;
  const latency = task.data_size * 0.8;

  return {
    execution_location: "Cloud Server",
    energy_consumed: energy,
    latency_observed: latency,
    status: latency <= task.latency_requirement ? "Success" : "Failed",
    remarks: "Processed in cloud due to high computational demand."
  };
}

function makeDecision(task) {
  if (task.required_power < 200 && task.latency_requirement < 60) {
    return processLocally(task);
  } else if (task.required_power < 400) {
    return processAtEdge(task);
  } else {
    return processAtCloud(task);
  }
}

function saveSimulationResult(taskId, result) {
  db.query(
    `INSERT INTO simulation_results 
     (task_id, execution_location, energy_consumed, latency_observed, status, remarks)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      taskId,
      result.execution_location,
      result.energy_consumed,
      result.latency_observed,
      result.status,
      result.remarks
    ]
  );
}

module.exports = {
  makeDecision,
  saveSimulationResult
};
