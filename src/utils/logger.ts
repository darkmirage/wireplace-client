const logger = {
  log: console.log,
  warn: console.warn,
  error: console.error,
};

// Silence console
console.log = () => {};

export default logger;
