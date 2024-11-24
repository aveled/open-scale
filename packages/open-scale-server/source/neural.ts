// deno-lint-ignore-file

import * as tf from '@tensorflow/tfjs';

import {
    RecordEvent,
} from './data.ts';



// Sample past events
const events: RecordEvent[] = [
    [1730123288213, 0.2, 1.33, 25000, 25916.73, 0.95, 0.01, 2000, 50, 20],
    [1730123298213, 0.2, 1.33, 25000, 25916.73, 0.95, 0.01, 2000, 50, 20],
    [1730151897213, 0.27, 2.16, 25000, 25822.25, 0.95, 0.01, 2000, 50, 20],
    [1730243930213, 0.18, 1.64, 25000, 23211.14, 0.95, 0.01, 2000, 50, 20],
    [1730354918213, 0.11, 0.91, 25000, 23264.73, 0.95, 0.01, 2000, 50, 20],
    [1730612992213, 0.33, 1.63, 25000, 24678.59, 0.95, 0.01, 2000, 50, 20],
    [1730927328213, 0.23, 1.49, 25000, 24595.76, 0.95, 0.01, 2000, 50, 20],
    [1731731538213, 0.44, 2.18, 25000, 24869.62, 0.95, 0.01, 2000, 50, 20],
    [1731800742213, 0.32, 1.51, 25000, 23821.24, 0.95, 0.01, 2000, 50, 20],
    [1732107629213, 0.19, 1.06, 25000, 22449.2, 0.95, 0.01, 2000, 50, 20],
    [1732308507213, 0.38, 1.67, 25000, 24622.8, 0.95, 0.01, 2000, 50, 20],
    [1732509637213, 0.14, 0.74, 25000, 24807.85, 0.95, 0.01, 2000, 50, 20],
    [1732970276213, 0.31, 1.38, 25000, 23825.59, 0.95, 0.01, 2000, 50, 20],
    [1733115050213, 0.49, 2.32, 25000, 24323.18, 0.95, 0.01, 2000, 50, 20],
    [1733849488213, 0.42, 2.23, 25000, 24245.9, 0.95, 0.01, 2000, 50, 20],
    [1733934682213, 0.08, 0.64, 25000, 23476.03, 0.95, 0.01, 2000, 50, 20],
    [1734328127213, 0.21, 1.78, 25000, 26065.95, 0.95, 0.01, 2000, 50, 20],
    [1734734580213, 0.49, 2.41, 25000, 23568.96, 0.95, 0.01, 2000, 50, 20],
    [1734880913213, 0.18, 1.09, 25000, 26094.07, 0.95, 0.01, 2000, 50, 20],
    [1734882862213, 0.39, 1.78, 25000, 25891.56, 0.95, 0.01, 2000, 50, 20],
    [1734905345213, 0.08, 0.91, 25000, 22787.53, 0.95, 0.01, 2000, 50, 20]
];

// Convert data into tensors for training
function prepareData(events: RecordEvent[]) {
    const inputs = events.map((event) => [event[3]]); // targetWeight as input
    const outputs = events.map((event) => [
        event[5], // fastSlowPercentage
        event[6], // errorPercentage
        event[7], // restingTime
        event[8], // fastFeedSpeed
        event[9], // slowFeedSpeed
    ]);
    return { inputs: tf.tensor2d(inputs), outputs: tf.tensor2d(outputs) };
}

async function trainModel(events: RecordEvent[]) {
    const { inputs, outputs } = prepareData(events);

    // Define model with constrained output
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 10, inputShape: [1], activation: "relu" }));
    model.add(tf.layers.dense({ units: 5, activation: "sigmoid" })); // Output between [0, 1]

    // Compile with custom loss
    model.compile({
        optimizer: tf.train.adam(0.01),
        loss: (yTrue, yPred) => {
            const lowerBounds = tf.tensor1d([0.7, 0.01, 100, 10, 10]);
            const upperBounds = tf.tensor1d([1, 0.1, 10000, 50, 50]);

            const belowLowerBound = tf.maximum(0, tf.sub(lowerBounds, yPred));
            const aboveUpperBound = tf.maximum(0, tf.sub(yPred, upperBounds));

            const rangePenalty = tf.sum(belowLowerBound).add(tf.sum(aboveUpperBound));
            const mse = tf.losses.meanSquaredError(yTrue, yPred);

            return mse.add(rangePenalty.mul(tf.scalar(100))); // Heavy penalty
        }
    });

    console.log("Training model...");
    await model.fit(inputs, outputs, { epochs: 50 });

    console.log("Model training complete.");
    return model;
}

function predictParameters(targetWeight: number, model: tf.LayersModel) {
    const input = tf.tensor2d([[targetWeight]]);
    const prediction = model.predict(input) as tf.Tensor;

    // Scale the sigmoid outputs
    const minValues = [0.1, 0.01, 100, 10, 5];
    const maxValues = [1, 0.1, 3000, 100, 50];

    const scaledPrediction = prediction.mul(tf.tensor1d(maxValues).sub(tf.tensor1d(minValues)))
                                       .add(tf.tensor1d(minValues));

    const parameters = scaledPrediction.dataSync();

    return {
        fastSlowPercentage: parameters[0],
        errorPercentage: parameters[1],
        restingTime: parameters[2],
        fastFeedSpeed: parameters[3],
        slowFeedSpeed: parameters[4]
    };
}


// Example usage
(async () => {
    const model = await trainModel(events);

    const newTargetWeight = 26000;
    const optimizedParams = predictParameters(newTargetWeight, model);

    console.log("Optimized Parameters for Target Weight:", newTargetWeight, optimizedParams);
})();
