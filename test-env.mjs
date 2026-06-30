import { spawn } from 'child_process';
process.env.TEST_VAR = JSON.stringify({ socketPath: "\0test.sock" });
console.log("Original:", process.env.TEST_VAR);

const child = spawn('node', ['-e', 'console.log("Child:", process.env.TEST_VAR)']);
child.stdout.on('data', d => process.stdout.write(d));
child.stderr.on('data', d => process.stderr.write(d));
