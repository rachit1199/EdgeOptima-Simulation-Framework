/**********************************************************************
 * EdgeOptima - Deep Q Learning (DQL / DQN) Offloading Engine
 * ------------------------------------------------------------
 * Actions:
 *   0 -> LOCAL
 *   1 -> EDGE
 *   2 -> CLOUD
 *
 * Objective:
 *   Minimize Energy–Latency cost using Deep Reinforcement Learning
 **********************************************************************/

const tf = require("@tensorflow/tfjs-node");

/**********************************************************************
 * HYPERPARAMETERS
 **********************************************************************/
const STATE_SIZE = 6;      // Task + system features
const ACTION_SIZE = 3;     // LOCAL, EDGE, CLOUD

const GAMMA = 0.95;        // Discount factor
const LEARNING_RATE = 0.001;
const EPSILON_START = 1.0;
const EPSILON_MIN = 0.01;
const EPSILON_DECAY = 0.995;

const BATCH_SIZE = 32;
const MEMORY_SIZE = 5000;

/**********************************************************************
 * REPLAY MEMORY
 **********************************************************************/
class ReplayMemory {
    constructor() {
        this.memory = [];
    }

    add(experience) {
        if (this.memory.length >= MEMORY_SIZE) {
            this.memory.shift();
        }
        this.memory.push(experience);
    }

    sample(batchSize) {
        const batch = [];
        for (let i = 0; i < batchSize; i++) {
            const index = Math.floor(Math.random() * this.memory.length);
            batch.push(this.memory[index]);
        }
        return batch;
    }

    size() {
        return this.memory.length;
    }
}

/**********************************************************************
 * DQN AGENT
 **********************************************************************/
class DQNAgent {

    constructor() {
        this.epsilon = EPSILON_START;
        this.memory = new ReplayMemory();
        this.model = this.buildModel();
    }

    buildModel() {
        const model = tf.sequential();

        model.add(tf.layers.dense({
            inputShape: [STATE_SIZE],
            units: 64,
            activation: "relu"
        }));

        model.add(tf.layers.dense({
            units: 64,
            activation: "relu"
        }));

        model.add(tf.layers.dense({
            units: ACTION_SIZE,
            activation: "linear"
        }));

        model.compile({
            optimizer: tf.train.adam(LEARNING_RATE),
            loss: "meanSquaredError"
        });

        return model;
    }

    async act(state) {

        // Exploration
        if (Math.random() < this.epsilon) {
            return Math.floor(Math.random() * ACTION_SIZE);
        }

        // Exploitation
        const stateTensor = tf.tensor2d([state]);
        const qValues = this.model.predict(stateTensor);
        const action = qValues.argMax(1).dataSync()[0];

        stateTensor.dispose();
        qValues.dispose();

        return action;
    }

    remember(state, action, reward, nextState, done) {
        this.memory.add({ state, action, reward, nextState, done });
    }

    async replay() {

        if (this.memory.size() < BATCH_SIZE) return;

        const batch = this.memory.sample(BATCH_SIZE);

        for (let exp of batch) {

            const { state, action, reward, nextState, done } = exp;

            let target = reward;

            if (!done) {
                const nextTensor = tf.tensor2d([nextState]);
                const futureQ = this.model.predict(nextTensor);
                target = reward + GAMMA * Math.max(...futureQ.dataSync());
                nextTensor.dispose();
                futureQ.dispose();
            }

            const stateTensor = tf.tensor2d([state]);
            const targetQ = this.model.predict(stateTensor);
            const targetData = targetQ.dataSync();

            targetData[action] = target;

            const updatedTarget = tf.tensor2d([targetData]);

            await this.model.fit(stateTensor, updatedTarget, {
                epochs: 1,
                verbose: 0
            });

            stateTensor.dispose();
            targetQ.dispose();
            updatedTarget.dispose();
        }

        if (this.epsilon > EPSILON_MIN) {
            this.epsilon *= EPSILON_DECAY;
        }
    }
}

/**********************************************************************
 * ENVIRONMENT MODEL (Edge–Cloud System)
 **********************************************************************/
class OffloadingEnvironment {

    constructor(params) {
        this.params = params;
    }

    computeMetrics(task, action) {

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
        } = this.params;

        const sizeMb = task.size * 8;

        let txTime = 0;
        let txEnergy = 0;
        let execTime = 0;
        let execEnergy = 0;

        if (action === 0) { // LOCAL

            execTime = (task.complexity / localCPU) * 1000;
            execEnergy = localExecPower * (execTime / 1000);

        } else if (action === 1) { // EDGE

            txTime = (sizeMb / bwLocalEdge) * 1000 + propagationDelay;
            txEnergy = devicePower * (txTime / 1000);

            execTime = (task.complexity / edgeCPU) * 1000;
            execEnergy = edgeExecPower * (execTime / 1000);

        } else { // CLOUD

            const tx1 = (sizeMb / bwLocalEdge) * 1000 + propagationDelay;
            const tx2 = (sizeMb / bwEdgeCloud) * 1000 + cloudDelay;

            txTime = tx1 + tx2;
            txEnergy = devicePower * (txTime / 1000);

            execTime = (task.complexity / cloudCPU) * 1000;
            execEnergy = cloudExecPower * (execTime / 1000);
        }

        const totalEnergy = txEnergy + execEnergy;
        const latency = txTime + execTime;

        return { totalEnergy, latency };
    }

    rewardFunction(energy, latency, deadline) {

        const { weightEnergy } = this.params;
        const wE = weightEnergy;
        const wL = 1 - wE;

        const penalty = latency > deadline ? -20 : 0;

        return -(wE * energy + wL * latency) + penalty;
    }
}

/**********************************************************************
 * TRAINING LOOP
 **********************************************************************/
async function trainDQL(params, episodes = 100) {

    const agent = new DQNAgent();
    const env = new OffloadingEnvironment(params);

    const convergence = [];

    for (let e = 0; e < episodes; e++) {

        let episodeReward = 0;

        for (let i = 0; i < params.numTasks; i++) {

            const task = {
                size: params.taskSize,
                complexity: params.taskComplexity,
                deadline: params.maxDeadline
            };

            const state = [
                task.size,
                task.complexity,
                params.bwLocalEdge,
                params.localCPU,
                params.edgeCPU,
                params.cloudCPU
            ];

            const action = await agent.act(state);

            const { totalEnergy, latency } =
                env.computeMetrics(task, action);

            const reward =
                env.rewardFunction(totalEnergy, latency, task.deadline);

            episodeReward += reward;

            const nextState = state;
            const done = true;

            agent.remember(state, action, reward, nextState, done);
        }

        await agent.replay();

        convergence.push(episodeReward);
    }

    return {
        agent,
        convergence
    };
}

/**********************************************************************
 * EXPORT
 **********************************************************************/
module.exports = {
    trainDQL
};



