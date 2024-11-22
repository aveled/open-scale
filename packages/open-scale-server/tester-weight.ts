// deno-lint-ignore-file require-await no-explicit-any no-unused-vars ban-unused-ignore

const ENDPOINT = 'http://localhost:8485';


async function setWeight(weight: number) {
    await fetch(ENDPOINT + '/test-set-weight', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            weight,
        }),
    });
}


async function getStatus() {
    const response = await fetch(ENDPOINT + '/status');
    return await response.json();
}

async function assertWeight(value: number) {
    const status = await getStatus();

    if (status.data.currentWeight !== value) {
        throw new Error(`Weight is not ${value} but ${status.data.currentWeight}`);
    } else {
        console.log(`[assert] Weight is ${value}`);
    }
}

async function assertStopped() {
    const status = await getStatus();

    if (status.data.active) {
        throw new Error('Scale is running');
    } else {
        console.log('[assert] Scale is stopped');
    }
}

async function start() {
    await fetch(ENDPOINT + '/start', {
        method: 'POST',
    });
}

async function stop() {
    await fetch(ENDPOINT + '/stop', {
        method: 'POST',
    });
}

async function setTargetWeight(weight: number) {
    await fetch(ENDPOINT + '/target-weight', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            targetWeight: weight,
        }),
    });
}

async function delay(seconds: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, seconds * 1000);
    });
}



const reset = async () => {
    await setWeight(0);
    await delay(0.2);
    await setWeight(0);
    await assertStopped();
}

const scenarioTest1 = async () => {
    await reset();

    await setTargetWeight(10000);
    await start();
    await assertWeight(0);
    await delay(0.2);
    await setWeight(2000);
    await delay(0.2);
    await assertWeight(2000);
    await delay(1);
    await setWeight(9500);
    await delay(0.2);
    await assertWeight(9500);
    await delay(1);
    await setWeight(9990);
    await delay(0.2);
    await assertWeight(9990);

    await reset();
}


const scenarios = [
    ['Test 1', scenarioTest1],
] as const;


for (const [name, scenario] of scenarios) {
    console.log(`Running scenario: ${name}`);
    await scenario();
}
