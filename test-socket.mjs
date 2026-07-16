const envVar = JSON.stringify({ socketPath: "\0test.sock" });
console.log("Stringified:", envVar);
const parsed = JSON.parse(envVar);
console.log("Parsed:", parsed);
