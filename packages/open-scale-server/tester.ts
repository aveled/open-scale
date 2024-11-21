// deno-lint-ignore-file require-await no-explicit-any no-unused-vars ban-unused-ignore

const ENDPOINT = 'http://localhost:8485';

async function setWeight(weight: number) {
    fetch(ENDPOINT + '/test-set-weight', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            weight,
        }),
    });
}

async function delay(seconds: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, seconds * 1000);
    });
}



const testSuite = async () => {
    await setWeight(2000);
    await delay(1);
    await setWeight(3000);
    await delay(1);
    await setWeight(4000);
    await delay(1);
    await setWeight(5000);
}

testSuite();
