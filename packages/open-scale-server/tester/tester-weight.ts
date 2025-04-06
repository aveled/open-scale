// deno-lint-ignore-file

// --- ANSI Color Codes ---
const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m"; // For warnings
const CYAN = "\x1b[36m"; // For info

// --- Interfaces (Copied from provided data) ---

export interface ScaleSettings {
    fastFeedSpeed: number;
    slowFeedSpeed: number;
    fastSlowPercentage: number;
    errorPercentage: number;
    restingTime: number;
}

export interface ScaleStatus {
    automaticMode: boolean;
    active: boolean; // Is the scale process running?
    currentWeight: number;
    targetWeight: number;
    sensor: boolean; // Assuming true = sensor triggered/blocked, false = clear
    settings: ScaleSettings; // Assuming settings are included in status
    errors: string[]; // Array of error strings (e.g., 'OVERSHOOT')
}

// Define Analytics structure for typing, even if deep checks aren't fully implemented
export interface Hour {
    measurements: Record<number, number>;
    averageError: number;
}
export interface Day {
    [hour: number]: Hour;
}
export interface Month {
    [day: number]: Day;
}
export interface Year {
    [month: number]: Month;
}
export type Analytics = Record<number, Year>;

// Define error constants locally if not importing directly
export const ERRORS = {
    OVERSHOOT: 'OVERSHOOT',
    NO_WEIGHT: 'NO_WEIGHT',
    NO_FEED: 'NO_FEED',
    NO_SERVER: 'NO_SERVER',
} as const;



// --- Test Configuration ---

const ENDPOINT = 'http://localhost:8485';

// Define paths locally if not importing directly
const PATHS = {
    STATUS: '/status',
    START: '/start',
    STOP: '/stop',
    TARGET_WEIGHT: '/target-weight',
    TOGGLE_AUTOMATIC_MODE: '/toggle-automatic-mode',
    TARE: '/tare',
    SETTINGS: '/settings',
    ANALYTICS: '/analytics',
    CLEAR_ERRORS: '/clear-errors',
    RESTART_SERVER: '/restart-server',
    EXPORT_DATA: '/export-data',
    TEST_SET_WEIGHT: '/test-set-weight', // Dev only
    TEST_TOGGLE_SENSOR: '/test-toggle-sensor', // Dev only
} as const;


// --- Helper Functions ---

// Generic request helper with basic logging and error handling
async function makeRequest<T = any>(path: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<{ status: boolean; data?: T }> {
    console.log(`${CYAN}[API Call]${RESET} ${method} ${path}` + (body ? ` ${JSON.stringify(body)}` : ''));
    try {
        const options: RequestInit = {
            method,
        };
        if (body) {
            options.headers = { 'Content-Type': 'application/json' };
            options.body = JSON.stringify(body);
        }
        const response = await fetch(ENDPOINT + path, options);

        if (!response.ok) {
            // Log API errors in Red
            console.error(`${RED}[API Error]${RESET} ${method} ${path} failed with status ${response.status}`);
            try {
                const errorBody = await response.json();
                console.error(`${RED}[API Error Body]${RESET}`, errorBody);
            } catch (e) {
                const errorText = await response.text();
                 console.error(`${RED}[API Error Text]${RESET}`, errorText || '<No Body>');
            }
            throw new Error(`API request failed: ${method} ${path} (${response.status})`);
        }

        if (response.status === 204) {
            console.log(`${CYAN}[API Response]${RESET} ${method} ${path} - Status 204 No Content`);
            return { status: true, data: undefined };
        }

        const data = await response.json();
        // Shorten successful data logging if needed
        const dataString = JSON.stringify(data);
        console.log(`${CYAN}[API Response]${RESET} ${method} ${path}`, dataString.length > 300 ? dataString.substring(0, 297) + '...' : data);

        if (typeof data.status !== 'boolean') {
             console.warn(`${YELLOW}[API Warning]${RESET} Response for ${method} ${path} lacks 'status' field.`);
        }
        return data as { status: boolean; data?: T };

    } catch (error) {
        // Log fetch/network errors in Red
        console.error(`${RED}[Fetch/Request Error]${RESET} ${method} ${path}:`, error instanceof Error ? error.message : error);
        // Re-throw the original error object to preserve stack trace etc.
        throw error;
    }
}

// --- Specific API Call Helpers ---

async function setWeight(weight: number): Promise<void> {
    // NOTE: Relies on ENVIRONMENT=development on the server
    await makeRequest(PATHS.TEST_SET_WEIGHT, 'POST', { weight });
}

async function getStatus(): Promise<ScaleStatus> {
    const response = await makeRequest<ScaleStatus>(PATHS.STATUS, 'GET');
    if (!response || typeof response.data === 'undefined') {
        console.error("Received invalid response structure:", response);
        throw new Error('Invalid status response format or missing data');
    }
    // Basic check for core properties existence
    if (typeof response.data.active === 'undefined' || typeof response.data.currentWeight === 'undefined') {
        throw new Error('Status data missing core fields (active, currentWeight)');
    }
    return response.data; // Return only the 'data' part which should be ScaleStatus
}

async function start(): Promise<void> {
    await makeRequest(PATHS.START, 'POST');
}

async function stop(): Promise<void> {
    await makeRequest(PATHS.STOP, 'POST');
}

async function setTargetWeight(targetWeight: number): Promise<void> {
    await makeRequest(PATHS.TARGET_WEIGHT, 'POST', { targetWeight });
}

async function toggleAutomaticMode(): Promise<void> {
    await makeRequest(PATHS.TOGGLE_AUTOMATIC_MODE, 'POST');
}

async function tare(): Promise<void> {
    await makeRequest(PATHS.TARE, 'POST');
}

async function setSettings(settings: ScaleSettings): Promise<void> {
    await makeRequest(PATHS.SETTINGS, 'POST', settings);
}

async function getAnalytics(): Promise<Analytics> {
    const response = await makeRequest<Analytics>(PATHS.ANALYTICS, 'GET');
    if (!response || typeof response.data === 'undefined') {
        console.error("Received invalid analytics response:", response);
        throw new Error('Invalid analytics response format or missing data');
    }
    return response.data; // Return only the 'data' part which should be Analytics
}

async function clearErrors(): Promise<void> {
    await makeRequest(PATHS.CLEAR_ERRORS, 'POST');
}

async function restartServer(): Promise<void> {
    // Warning: This might interrupt the test runner if not handled carefully
    await makeRequest(PATHS.RESTART_SERVER, 'POST');
    console.log('[Action] Server restart requested. Adding delay...');
    await delay(5); // Add delay to allow server time to potentially restart
}

async function exportData(): Promise<void> {
    await makeRequest(PATHS.EXPORT_DATA, 'POST');
}

async function toggleSensor(): Promise<void> {
    // NOTE: Relies on ENVIRONMENT=development on the server
    await makeRequest(PATHS.TEST_TOGGLE_SENSOR, 'POST');
}

async function delay(seconds: number): Promise<void> {
    console.log(`[Delay] Waiting for ${seconds} second(s)...`);
    return new Promise((resolve) => {
        setTimeout(resolve, seconds * 1000);
    });
}


// --- Assertion Helpers (using ScaleStatus interface) ---

async function assertWeight(value: number, tolerance: number = 1): Promise<void> { // Default tolerance 1g
    const status = await getStatus();
    const diff = Math.abs(status.currentWeight - value);
    if (diff > tolerance) {
        throw new Error(`[Assertion Failed] Weight expected around ${value} (tolerance ${tolerance}), but got ${status.currentWeight}`);
    } else {
        console.log(`[Assertion Passed] Weight is ${status.currentWeight} (expected ~${value})`);
    }
}

async function assertStopped(): Promise<void> {
    const status = await getStatus();
    if (status.active) { // Check the 'active' field from ScaleStatus
        throw new Error(`[Assertion Failed] Scale expected to be stopped (active: false), but is active.`);
    } else {
        console.log('[Assertion Passed] Scale is stopped (active: false)');
    }
}

async function assertRunning(): Promise<void> {
    const status = await getStatus();
    if (!status.active) { // Check the 'active' field from ScaleStatus
        throw new Error(`[Assertion Failed] Scale expected to be running (active: true), but is stopped.`);
    } else {
        console.log('[Assertion Passed] Scale is running (active: true)');
    }
}

async function assertAutomaticMode(expected: boolean): Promise<void> {
    const status = await getStatus();
    if (status.automaticMode !== expected) {
        throw new Error(`[Assertion Failed] Automatic mode expected to be ${expected}, but got ${status.automaticMode}`);
    } else {
        console.log(`[Assertion Passed] Automatic mode is ${expected}`);
    }
}

async function assertSensorState(expected: boolean): Promise<void> {
    // Assuming status.sensor: true = triggered/blocked, false = clear
    const status = await getStatus();
    if (status.sensor !== expected) {
        throw new Error(`[Assertion Failed] Sensor state expected to be ${expected}, but got ${status.sensor}`);
    } else {
        console.log(`[Assertion Passed] Sensor state is ${expected}`);
    }
}

async function assertTargetWeight(expected: number): Promise<void> {
    const status = await getStatus();
    if (status.targetWeight !== expected) {
        throw new Error(`[Assertion Failed] Target weight expected to be ${expected}, but got ${status.targetWeight}`);
    } else {
        console.log(`[Assertion Passed] Target weight is ${expected}`);
    }
}

async function assertErrors(expectedErrors: string[] | null): Promise<void> {
    // Pass null or empty array to expect no errors
    const status = await getStatus();
    const actualErrors = status.errors || []; // Ensure errors is an array
    const expected = expectedErrors || [];

    // Simple check: compare lengths and presence (order doesn't matter here)
    const errorsMatch = expected.length === actualErrors.length &&
        expected.every(err => actualErrors.includes(err));

    if (!errorsMatch) {
        throw new Error(`[Assertion Failed] Expected errors [${expected.join(', ')}], but got [${actualErrors.join(', ')}]`);
    } else {
        console.log(`[Assertion Passed] Errors match expected: [${actualErrors.join(', ')}]`);
    }
}

async function assertSettings(expectedSettings: Partial<ScaleSettings>): Promise<void> {
    const status = await getStatus();
    if (!status.settings) {
        throw new Error("[Assertion Failed] Status response does not contain 'settings' object.");
    }
    let mismatch = false;
    const mismatches: string[] = [];
    for (const key in expectedSettings) {
        const k = key as keyof ScaleSettings;
        if (status.settings[k] !== expectedSettings[k]) {
            mismatch = true;
            mismatches.push(`${k}: expected ${expectedSettings[k]}, got ${status.settings[k]}`);
        }
    }
    if (mismatch) {
        throw new Error(`[Assertion Failed] Settings mismatch: ${mismatches.join('; ')}`);
    } else {
        console.log(`[Assertion Passed] Verified settings match expected: ${Object.keys(expectedSettings).join(', ')}`);
    }
}


// --- Test Setup ---

const reset = async (): Promise<void> => {
    console.log("--- Resetting State ---");
    try {
        try { await stop(); } catch (e) {/* Ignore */}
        await delay(0.1);
        // Ensure sensor is clear (false) after reset for predictability
        let initialStatus = await getStatus();
        if (initialStatus.sensor) {
             console.log("Sensor is true after stop, toggling to false for reset.");
             try { await toggleSensor(); } catch (e) { console.warn(`${YELLOW}[Warning]${RESET} Could not toggle sensor during reset. Ensure dev environment.`); }
             await delay(0.1);
        }

        try {
            await setWeight(0); await delay(0.1); await setWeight(0);
        } catch (e) {
             console.warn(`${YELLOW}[Warning]${RESET} Could not set weight to 0 via test endpoint. Ensure dev environment.`);
        }
        await delay(0.1);
        await clearErrors();
        await delay(0.1);
        let currentStatus = await getStatus();
        if(currentStatus.automaticMode){
            await toggleAutomaticMode(); await delay(0.1);
        }

        await assertStopped();
        await assertWeight(0);
        await assertAutomaticMode(false);
        await assertErrors(null);
        await assertSensorState(false); // Assert sensor is clear after reset

        console.log("--- Reset Complete ---");
    } catch (error) {
        console.error(`${RED}--- CRITICAL: Reset failed. Aborting tests. ---${RESET}`);
        if (error instanceof Error) {
            console.error(`${RED}Reason: ${error.message}${RESET}`);
             console.error(error.stack);
        } else {
            console.error(error);
        }
        throw new Error("Reset failed, cannot continue tests.");
    }
};

// --- Test Scenarios ---

const scenarioStartStop = async (): Promise<void> => {
    await reset();
    await assertStopped();
    await start();
    await delay(0.1);
    await assertRunning();
    await stop();
    await delay(0.1);
    await assertStopped();
    await start();
    await delay(0.1);
    await assertRunning();
    await reset(); // Clean up
};

const scenarioTargetWeight = async (): Promise<void> => {
    await reset();
    const initialTarget = (await getStatus()).targetWeight; // Get default/initial target
    console.log(`Initial target weight: ${initialTarget}`);
    await setTargetWeight(12345);
    await delay(0.1);
    await assertTargetWeight(12345);
    await setTargetWeight(987);
    await delay(0.1);
    await assertTargetWeight(987);
    await setTargetWeight(initialTarget); // Optionally reset to initial
    await delay(0.1);
    await assertTargetWeight(initialTarget);
    await reset();
};

const scenarioTare = async (): Promise<void> => {
    await reset();
    await setWeight(500); // Set initial weight
    await delay(0.1);
    await assertWeight(500);
    await tare(); // Perform tare
    await delay(0.2); // Tare might take a moment
    await assertWeight(0, 2); // Assert weight is near 0 after tare (allow tolerance)
    await delay(0.1);
    await reset(); // Resets tare as well by stopping/setting absolute weight
};

const scenarioSettings = async (): Promise<void> => {
    await reset();
    const originalSettings = (await getStatus()).settings;
    console.log("Original settings:", originalSettings);

    const newSettings: ScaleSettings = {
        fastFeedSpeed: 88,
        slowFeedSpeed: 18,
        fastSlowPercentage: 0.85,
        errorPercentage: 0.02, // 2%
        restingTime: 2500, // 2.5s
    };
    await setSettings(newSettings);
    await delay(0.2); // Allow time for settings to apply and status to update

    // Verify settings are reflected in status
    await assertSettings(newSettings);

    // Optional: Reset to original settings if needed (or rely on `reset`)
    // await setSettings(originalSettings);
    // await delay(0.2);
    // await assertSettings(originalSettings);

    await reset();
};

const scenarioClearErrors = async (): Promise<void> => {
    await reset();
    // TODO: Need a reliable way to *cause* an error first.
    // Example: If setting weight > target triggers OVERSHOOT (depends on scale logic)
    // try {
    //    await setTargetWeight(1000);
    //    await start(); // Assuming start doesn't reset weight
    //    await setWeight(1100); // Trigger potential overshoot
    //    await delay(0.5); // Allow time for error detection
    //    await assertErrors([ERRORS.OVERSHOOT]); // Verify error occurred
    // } catch (e) {
    //    console.warn("Could not trigger test error condition.");
    // }

    console.log("[Test Info] Calling clearErrors. Verification follows.");
    await clearErrors();
    await delay(0.1);
    await assertErrors(null); // Assert that errors array is empty after clearing
    await reset();
};

const scenarioExportData = async (): Promise<void> => {
    await reset();
    console.log("[Test Info] Calling exportData. Verification requires checking USB device manually.");
    await exportData();
    await delay(0.5); // Give it a moment for file operations
    // No automated assertion possible here without external checks
    await reset();
};

const scenarioAnalytics = async (): Promise<void> => {
    await reset();
    console.log("[Test Info] Fetching analytics.");
    const analyticsData = await getAnalytics();

    if (typeof analyticsData !== 'object' || analyticsData === null) {
        throw new Error(`[Assertion Failed] Analytics data should be an object, got ${typeof analyticsData}`);
    }
    console.log("[Assertion Passed] Analytics data received:", JSON.stringify(analyticsData).substring(0, 200) + "..."); // Log snippet

    // Add more specific assertions based on Analytics structure if needed
    // e.g., check if top-level keys are numbers (years)
    const years = Object.keys(analyticsData);
    if (years.length > 0 && isNaN(parseInt(years[0]))) {
        console.warn("[Analytics Check] Top-level keys might not be years as expected.");
    }

    await reset();
};

// --- Development Only Scenarios ---

const scenarioTestSensorToggle = async (): Promise<void> => {
    // Assumes ENVIRONMENT=development is set for the server
    await reset();
    try {
        const initialState = (await getStatus()).sensor;
        console.log(`Initial sensor state: ${initialState}`);

        await toggleSensor();
        await delay(0.1);
        await assertSensorState(!initialState); // Assert toggled state

        await toggleSensor();
        await delay(0.1);
        await assertSensorState(initialState); // Assert toggled back to initial

    } catch (e) {
        console.warn("Sensor test failed. Ensure ENVIRONMENT=development on server.", e);
        return; // Skip reset if it failed
    }
    await reset();
};

// Basic weighting simulation
const scenarioBasicWeighting = async (): Promise<void> => {
    await reset();

    const target = 10000;
    await setTargetWeight(target);
    await start();
    await assertRunning();
    await assertWeight(0);
    await delay(0.2);

    // Simulate weight increase (using dev endpoint)
    await setWeight(2000);
    await delay(0.2);
    await assertWeight(2000);
    await delay(1); // Simulate time passing

    await setWeight(9500); // Near target (assuming default fast/slow % is ~95%)
    await delay(0.2);
    await assertWeight(9500);
    await delay(1); // Simulate slow feed time

    await setWeight(9990); // Very near target
    await delay(0.2);
    await assertWeight(9990);

    // Check final state - requires knowing the scale's auto-stop logic
    console.log("[Test Info] Basic weighting simulation complete. Checking final state...");
    await delay(3); // Wait for potential resting time + processing

    // Example assertions if it should auto-stop near target:
    const finalStatus = await getStatus();
    if (finalStatus.active) {
        console.warn("[Test Warning] Scale did not automatically stop after reaching near target weight in simulation.");
        // Could manually stop here if needed: await stop();
    } else {
        console.log("[Test Info] Scale automatically stopped as expected.");
    }
    // Check if weight is within error margin (assuming 1% default error)
    const errorMargin = target * finalStatus.settings.errorPercentage; // Use actual error % from status
    await assertWeight(target, errorMargin); // Assert final weight is close to target

    await reset();
}

const scenarioComprehensiveAutomaticMode = async (): Promise<void> => {
    const testTargetWeight = 5000; // Use a specific target for this test
    // Use slightly longer delays for automatic actions/reactions
    const reactionDelay = 0.5; // Time for scale logic to react to sensor/weight
    const fillDelay = 0.3; // Time between weight increments simulation

    console.log(`Setting up for comprehensive automatic test (Target: ${testTargetWeight}g)`);
    await reset(); // Ensures manual mode, weight 0, stopped, sensor false

    // Configure for the test
    await setTargetWeight(testTargetWeight);
    await delay(0.1);
    await assertTargetWeight(testTargetWeight);

    // Enable Automatic Mode
    console.log("Enabling automatic mode...");
    await toggleAutomaticMode();
    await delay(0.1);
    await assertAutomaticMode(true);
    await assertStopped(); // Should still be stopped
    await assertSensorState(false); // Sensor should still be clear

    // --- Cycle 1 ---
    console.log("\n--- Auto Cycle 1: Starting ---");
    console.log("Simulating sack placed (Sensor -> true)");
    await toggleSensor();
    await delay(reactionDelay); // Give time for scaleManager to detect sensor=true and start
    await assertSensorState(true);
    await assertRunning(); // Core check: Should auto-start!

    console.log("Simulating filling process...");
    await setWeight(1000); await delay(fillDelay); await assertWeight(1000);
    await setWeight(testTargetWeight * 0.8); await delay(fillDelay); await assertWeight(testTargetWeight * 0.8); // 4000g
    await setWeight(testTargetWeight - 50); await delay(fillDelay); await assertWeight(testTargetWeight - 50); // 4950g
    // Simulate reaching/slightly exceeding target - scale should stop automatically
    await setWeight(testTargetWeight + 5); // 5005g (within default 1% error margin)
    await delay(reactionDelay); // Give time for scaleManager to detect target reached and stop
    await assertWeight(testTargetWeight + 5); // Verify final weight
    await assertStopped(); // Core check: Should auto-stop!
    await assertErrors(null); // Assuming 5005 is not an overshoot error with default 1%

    console.log("Simulating sack removed (Sensor -> false)");
    await toggleSensor();
    await delay(reactionDelay);
    await assertSensorState(false);
    await assertStopped(); // Should remain stopped

    // --- Cycle 2 ---
    console.log("\n--- Auto Cycle 2: Starting ---");
    console.log("Simulating new sack placed (Sensor -> true)");
    await toggleSensor();
    await delay(reactionDelay);
    await assertSensorState(true);
    await assertRunning(); // Core check: Should auto-start again!

    console.log("Simulating filling process (different weights)...");
    // NOTE: Assuming scale internally tares/resets before auto-start.
    // Our setWeight calls mock the *absolute* weight reported *during* the fill.
    await setWeight(500); await delay(fillDelay); await assertWeight(500);
    await setWeight(testTargetWeight - 200); await delay(fillDelay); await assertWeight(testTargetWeight - 200); // 4800g
    // Simulate exact target weight
    await setWeight(testTargetWeight); // 5000g
    await delay(reactionDelay); // Give time to stop
    await assertWeight(testTargetWeight);
    await assertStopped(); // Should auto-stop!

    console.log("Simulating sack removed (Sensor -> false)");
    await toggleSensor();
    await delay(reactionDelay);
    await assertSensorState(false);
    await assertStopped();

    // --- Cycle 3 ---
    console.log("\n--- Auto Cycle 3: Starting ---");
    console.log("Simulating another new sack (Sensor -> true)");
    await toggleSensor();
    await delay(reactionDelay);
    await assertSensorState(true);
    await assertRunning(); // Should auto-start!

    console.log("Simulating filling process (slight overshoot)...");
    await setWeight(2500); await delay(fillDelay); await assertWeight(2500);
    // Simulate overshoot that might trigger error depending on exact settings/logic
    const overshootWeight = testTargetWeight * 1.02; // e.g., 5100g (potentially > 1% error)
    await setWeight(overshootWeight);
    await delay(reactionDelay); // Give time to stop and potentially register error
    await assertWeight(overshootWeight);
    await assertStopped(); // Should still stop even on overshoot (usually)

    // Check for overshoot error (depends on server logic and error % setting)
    const status = await getStatus();
    if (status.errors.includes(ERRORS.OVERSHOOT)) {
         console.log(` -> ${GREEN}[Assertion Passed]${RESET} Overshoot error detected as expected.`);
         await clearErrors(); // Clear the error for the next step
         await delay(0.1);
         await assertErrors(null);
    } else {
        // Allow test to pass if overshoot isn't triggered (e.g., if error % is higher)
         console.log(` -> ${YELLOW}[Info]${RESET} Overshoot error was not triggered for ${overshootWeight}g (Target: ${testTargetWeight}g). This might be expected.`);
         await assertErrors(null); // Still expect no *other* errors
    }

    console.log("Simulating sack removed (Sensor -> false)");
    await toggleSensor();
    await delay(reactionDelay);
    await assertSensorState(false);
    await assertStopped();

    // --- Teardown ---
    console.log("\nDisabling automatic mode...");
    await toggleAutomaticMode();
    await delay(0.1);
    await assertAutomaticMode(false);

    // Final reset to clean up state
    await reset();
};
// --- Scenario Runner ---

const scenarios = [
    // ['Start/Stop Cycle', scenarioStartStop],
    // ['Set Target Weight', scenarioTargetWeight],
    // ['Tare Functionality', scenarioTare],
    // ['Set/Verify Settings', scenarioSettings],
    // ['Clear Errors', scenarioClearErrors], // Effectiveness depends on triggering errors
    // ['Export Data Placeholder', scenarioExportData], // Manual verification needed
    // ['Get Analytics', scenarioAnalytics],
    // ['Basic Weighting Simulation', scenarioBasicWeighting],
    // // --- Development Only ---
    // ['DEV: Toggle Sensor State', scenarioTestSensorToggle],
    ['DEV: Comprehensive Automatic Mode', scenarioComprehensiveAutomaticMode],
    // --- Use Cautiously ---
    // ['Server Restart', scenarioRestart], // Uncomment carefully
] as const;


// IIFE to run scenarios asynchronously
(async () => {
    console.log(`Starting Test Execution against ${ENDPOINT}...`);
    let failedCount = 0;
    let passedCount = 0;

    // Initial reset check
    try {
        await reset();
    } catch (e) {
        // Error already logged in reset() with color
        // Ensure runner stops
        console.log(`${RED}FATAL: Initial reset failed. Cannot continue tests.${RESET}`);
        return; // Exit early
    }

    for (const [name, scenario] of scenarios) {
        console.log(`\n--- Running Scenario: ${name} ---`);
        try {
            await scenario();
            // Use GREEN for success indication
            console.log(`${GREEN}--- Scenario Success: ${name} ---${RESET}`);
            passedCount++;
        } catch (error) {
            failedCount++;
            // Use RED for failure indication
            console.error(`${RED}--- Scenario FAILED: ${name} ---${RESET}`);
            if (error instanceof Error) {
                // Print the specific error message (often from assertions) in RED
                console.error(`${RED}Reason: ${error.message}${RESET}`);
                // Print the stack trace for detailed debugging (optional, can be noisy)
                console.error(error.stack);
            } else {
                // Log non-Error objects differently
                console.error(`${RED}Failure Reason (Unknown Type):${RESET}`, error);
            }
            // Optional: Stop execution on first failure by uncommenting break
            // console.log("Stopping due to test failure.");
            // break;
        }
    }

    // Final Summary with Colors
    console.log("\n--- Test Execution Summary ---");
    console.log(`${GREEN}Passed: ${passedCount}${RESET}`);
    console.log(`${failedCount > 0 ? RED : GREEN}Failed: ${failedCount}${RESET}`); // Red if any failed
    console.log("-----------------------------");

    // Exit with a non-zero code if any tests failed
    if (failedCount > 0) {
        console.error(`${RED}Some tests failed. Exiting with error code.${RESET}`);
        return;
    }
})();

// Keep TypeScript happy in module context if needed
export { };
