import React, { useState } from "react";

/* =======================
   TYPES
======================= */

interface Utilization {
  load: number;
}

interface EdgeServer {
  id: number;
  name: string;
  capacity: number;
  currentLoad: number;
  processingPower: number;
  totalTasksProcessed: number;
  utilization: Utilization[];
}

interface Device {
  id: number;
  name: string;
  type: string;
  batteryLevel: number;
  processingPower: number;
  totalTasksProcessed: number;
}

interface Task {
  id: number;
  type: string;
  location?: string;
  energy?: number;
  latency?: number;
  latencyRequirement: number;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "completed" | "failed";
  color: string;
  createdAt: string;
  completedAt?: string;
}

/* =======================
   COMPONENT
======================= */

export default function EdgeCloudOptimizer() {
  /* ---------- STATE ---------- */

  const [edgeServers] = useState<EdgeServer[]>([
    {
      id: 1,
      name: "Edge Server 1",
      capacity: 100,
      currentLoad: 40,
      processingPower: 1500,
      totalTasksProcessed: 320,
      utilization: [{ load: 60 }, { load: 70 }]
    }
  ]);

  const [devices] = useState<Device[]>([
    {
      id: 1,
      name: "IoT Sensor A",
      type: "Sensor",
      batteryLevel: 78,
      processingPower: 120,
      totalTasksProcessed: 90
    }
  ]);

  const [tasks] = useState<Task[]>([
    {
      id: 1,
      type: "Image Processing",
      location: "Edge",
      energy: 12.5,
      latency: 35,
      latencyRequirement: 50,
      priority: "high",
      status: "pending",
      color: "#facc15",
      createdAt: new Date().toISOString()
    }
  ]);

  const [completedTasks] = useState<Task[]>([
    {
      id: 2,
      type: "Data Aggregation",
      location: "Cloud",
      energy: 20.3,
      latency: 80,
      latencyRequirement: 100,
      priority: "medium",
      status: "completed",
      color: "#22c55e",
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    }
  ]);

  /* ---------- CALCULATIONS ---------- */

  const averageEdgeUtilization =
    edgeServers.length > 0
      ? (
          edgeServers[0].utilization.reduce(
            (sum: number, u: Utilization) => sum + u.load,
            0
          ) / edgeServers[0].utilization.length
        ).toFixed(2)
      : "0";

  const averageBattery =
    devices.length > 0
      ? (
          devices.reduce(
            (sum: number, d: Device) => sum + d.batteryLevel,
            0
          ) / devices.length
        ).toFixed(2)
      : "0";

  /* =======================
     UI
======================= */

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Edge–Cloud Task Optimizer</h1>

      <h2>📡 Edge Servers</h2>
      {edgeServers.map(edge => (
        <div key={edge.id} style={{ marginBottom: "10px" }}>
          <strong>{edge.name}</strong>
          <p>Load: {edge.currentLoad}/{edge.capacity}</p>
          <p>Power: {edge.processingPower} MIPS</p>
          <p>Tasks Processed: {edge.totalTasksProcessed}</p>
        </div>
      ))}

      <h2>🔋 Devices</h2>
      {devices.map(device => (
        <div key={device.id}>
          <strong>{device.name}</strong>
          <p>Battery: {device.batteryLevel}%</p>
          <p>Tasks: {device.totalTasksProcessed}</p>
        </div>
      ))}

      <h2>📊 Statistics</h2>
      <p>Average Edge Utilization: {averageEdgeUtilization}%</p>
      <p>Average Device Battery: {averageBattery}%</p>

      <h2>📝 Tasks</h2>
      {[...tasks, ...completedTasks].map(task => (
        <div
          key={task.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "8px"
          }}
        >
          <strong>{task.type}</strong>
          <p>Status: {task.status}</p>
          <p>Priority: {task.priority}</p>
          <p>Latency: {task.latency ?? "N/A"} ms</p>
          <p>Energy: {task.energy ?? "N/A"} J</p>
        </div>
      ))}
    </div>
  );
}
