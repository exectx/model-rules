// from tldraw
export function singleton<T>(key: string, init: () => T): T {
  const symbol = Symbol.for(`com.modelrules.state/${key}`);
  const global = globalThis as any;
  global[symbol] ??= init();
  return global[symbol];
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && !Array.isArray(value) && typeof value === "object";
}

export function makeError(exception: unknown): Error {
  if (exception instanceof Error) {
    return exception;
  }
  const type = typeof exception;
  if (type === "undefined" || type === "function" || exception === null) {
    return new Error("unknown exception");
  }
  if (type !== "object") {
    return new Error(String(exception));
  }
  if (isObject(exception)) {
    let errorMsg: string | undefined = undefined;
    if (typeof exception.message === "string") {
      errorMsg = exception.message;
    } else {
      try {
        errorMsg = JSON.stringify(exception.message);
      } catch (e) {
        errorMsg = "Unserializable object thrown as exception";
      }
    }
    const error = new Error(errorMsg, { cause: exception.cause });
    if (typeof exception.name === "string") {
      error.name = exception.name;
    }
    if (typeof exception.stack === "string") {
      error.stack = exception.stack;
    }
    return error;
  }
  if (Array.isArray(exception)) {
    return new Error(`Array thrown: ${String(exception)}`);
  }
  return new Error("unknown exception");
}

export function tryCatch<T>(fn: () => T): T | Error;
export function tryCatch<T>(fn: () => Promise<T>): Promise<T | Error>;
export function tryCatch<T, OnError>(
  fn: () => T,
  onError: (e: Error) => OnError
): T | OnError;
export function tryCatch<T, OnError>(
  fn: () => Promise<T>,
  onError: (e: Error) => OnError | Promise<OnError>
): Promise<T | OnError>;
export function tryCatch<T>(fn: Promise<T>): Promise<T | Error>;
export function tryCatch<T, OnError>(
  fn: Promise<T>,
  onError: (e: Error) => OnError | Promise<OnError>
): Promise<T | OnError>;
export function tryCatch<T, OnError>(
  fn: (() => T | Promise<T>) | Promise<T>,
  onError?: (e: Error) => OnError | Promise<OnError>
): T | OnError | Error | Promise<T | OnError | Error> {
  if (fn instanceof Promise) {
    return fn.catch((exception) => {
      const e = makeError(exception);
      return onError ? onError(e) : e;
    });
  }
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.catch((exception) => {
        const e = makeError(exception);
        return onError ? onError(e) : e;
      });
    }
    return result;
  } catch (exception) {
    const e = makeError(exception);
    return onError ? onError(e) : e;
  }
}

export type Result<T, E = Error> = [T, null] | [null, E];
export function safeTry<T>(fn: () => Promise<T>): Promise<Result<T, Error>>;
export function safeTry<T>(fn: () => T): Result<T, Error>;
export function safeTry<T>(fn: Promise<T>): Promise<Result<T, Error>>;
export function safeTry<T>(
  fn: (() => T) | (() => Promise<T>) | Promise<T>
): Result<T, Error> | Promise<Result<T, Error>> {
  if (fn instanceof Promise) {
    return fn.then(
      (result) => [result, null],
      (error) => [null, makeError(error)]
    );
  }
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.then(
        (value) => [value, null],
        (error) => [null, makeError(error)]
      );
    } else {
      return [result, null];
    }
  } catch (error) {
    return [null, makeError(error)];
  }
}
