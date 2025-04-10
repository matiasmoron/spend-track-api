import { bold, green, red, yellow, cyan } from 'colorette';

function formatArgs(args: unknown[]) {
  return args
    .map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2)))
    .join(' ');
}

export const log = {
  info: (...args: unknown[]) => {
    console.log(cyan('[INFO]'), formatArgs(args));
  },
  success: (...args: unknown[]) => {
    console.log(green('[SUCCESS]'), formatArgs(args));
  },
  warn: (...args: unknown[]) => {
    console.log(yellow('[WARN]'), formatArgs(args));
  },
  error: (...args: unknown[]) => {
    console.log(red('[ERROR]'), formatArgs(args));
  },
  debug: (...args: unknown[]) => {
    console.log(bold('[DEBUG]'), formatArgs(args));
  },
};
