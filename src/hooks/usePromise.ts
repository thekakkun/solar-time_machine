import { useEffect, useState } from "react";

type PromiseState<T> = PromisePending | PromiseFulfilled<T> | PromiseRejected;

type PromisePending = {};
interface PromiseFulfilled<T> {
  value: T;
}
interface PromiseRejected {
  reason: any;
}

export default function usePromise<T>(promise: Promise<T>): PromiseState<T> {
  const [promiseState, setPromiseState] = useState<PromiseState<T>>({});

  useEffect(() => {
    async function _fn() {
      try {
        setPromiseState({ value: await promise });
      } catch (e: any) {
        setPromiseState({ reason: e });
      }
    }

    if (!promiseState) {
      _fn();
    }
  }, []);

  return promiseState;
}
