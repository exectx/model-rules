import type { SubmissionResult } from "@conform-to/react";
import { useEffect, useRef } from "react";
// import { type FetcherWithComponents, type useLoaderData } from "react-router";

export function useFormCalls<T>(props: {
  formResult?: SubmissionResult<string[]>;
  actionResult: T;
  //   actionResult: FetcherWithComponents<SubmissionResult<string[]>>;
  onSuccess?: (formResult: SubmissionResult<string[]>, actionResult: T) => void;
  onError?: (formResult: SubmissionResult<string[]>, actionResult: T) => void;
}) {
  const prevData = useRef(props.formResult);
  useEffect(() => {
    if (props.formResult !== prevData.current) {
      if (props.formResult?.status === "success") {
        props.onSuccess?.(props.formResult, props.actionResult);
      } else if (props.formResult?.status === "error") {
        props.onError?.(props.formResult, props.actionResult);
      }
      prevData.current = props.formResult;
    }
  }, [props.formResult]);
}
