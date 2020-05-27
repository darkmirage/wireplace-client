const realLog = console.log;
const nullLog = () => {};

async function silentConsole<T>(job: () => Promise<T> | T): Promise<T> {
  console.log = nullLog;
  try {
    const result = await job();
    console.log = nullLog;
    return result;
  } finally {
    console.log = realLog;
  }
}

export default silentConsole;