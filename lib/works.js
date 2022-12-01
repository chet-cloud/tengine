const { Worker } = require('worker_threads')

const runService = (WorkerData) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./workerExample.js', { WorkerData });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
        if (code !== 0)
            reject(new Error(`stopped with  ${code} exit code`));
        })
    })
}

const run = async () => {
    const result = await runService('hello node.js')
    console.log(result);
}

run().catch(err => console.error(err))