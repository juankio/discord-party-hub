import { Worker, isMainThread, workerData } from 'worker_threads';
if (isMainThread) {
  process.env.MY_VAR = "hello";
  console.log("Main:", process.env.MY_VAR);
  new Worker(new URL(import.meta.url));
} else {
  console.log("Worker:", process.env.MY_VAR);
}
