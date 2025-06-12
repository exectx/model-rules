import { useInputControl } from "@conform-to/react";
import { Checkbox } from "./ui/checkbox";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import React, { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";
import { AlertCircleIcon, Info, TriangleAlert } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { motion, AnimatePresence } from "motion/react";
import useMeasure from "react-use-measure";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface InputProps extends Omit<CheckboxPrimitive.CheckboxProps, "type"> {
  type: string;
  name: string;
  form: string;
  value?: string;
}

interface CheckboxProps
  extends React.ComponentProps<typeof CheckboxPrimitive.Root> {}

interface CheckboxFieldProps {
  inputProps: InputProps;
  checkboxProps?: CheckboxProps;
  errors?: string[];
}

export function CheckboxField({
  checkboxProps,
  inputProps,
  errors,
}: CheckboxFieldProps) {
  const targetValue = inputProps.value ?? "on";
  // const [meta] = useField(inputProps.name);
  const input = useInputControl({
    key: inputProps.key,
    name: inputProps.name,
    formId: inputProps.form,
  });
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <Checkbox
      {...checkboxProps}
      {...inputProps}
      id={id}
      aria-invalid={errorId ? true : undefined}
      checked={input.value === targetValue}
      onCheckedChange={(state) => {
        input.change(state.valueOf() ? targetValue : "");
        inputProps.onCheckedChange?.(state);
      }}
      onFocus={(e) => {
        input.focus();
        inputProps.onFocus?.(e);
      }}
      onBlur={(e) => inputProps.onBlur?.(e)}
      type="button"
    />
  );
}

export function OutputField(props: {
  inputId?: string;
  errors?: string[];
  info?: React.ReactNode;
}) {
  if (!props.errors && !props.info) return null;

  let describedBy = props.errors ? `${props.inputId}-error` : undefined;
  describedBy ??= props.inputId ? `${props.inputId}-helper` : undefined;

  return (
    <output
      aria-describedby={describedBy}
      className={cn("text-sm text-muted-foreground flex items-start gap-2", {
        "text-destructive": Boolean(props.errors),
      })}
    >
      {props.errors ? (
        <TriangleAlert className="size-3 mt-[4px] shrink-0" />
      ) : (
        <Info className="size-3 mt-[4px] shrink-0" />
      )}
      {props.errors ? (
        <span>{props.errors.join(", ")}</span>
      ) : typeof props.info === "string" ? (
        <span>{props.info}</span>
      ) : (
        props.info
      )}
    </output>
  );
}

export function InputField(props: {
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  inputProps:
    | (React.InputHTMLAttributes<HTMLInputElement> & { element?: undefined })
    | { id?: string; element: React.ReactNode };
  errors?: string[];
  helper?: string;
  className?: string;
}) {
  const fallbackId = useId();
  const id =
    "element" in props.inputProps
      ? (props.inputProps.id ?? fallbackId)
      : (props.inputProps.id ?? fallbackId);
  const errorId = props.errors?.length ? `${id}-error` : undefined;
  const helperId = props.helper ? `${id}-helper` : undefined;
  const describedBy = errorId ?? helperId;
  const Custom =
    "element" in props.inputProps ? props.inputProps.element : undefined;
  return (
    <div
      className={cn("flex flex-col gap-2", props.className)}
      style={{ marginBottom: Boolean(describedBy) ? "0" : "-0.5rem" }}
    >
      <Label htmlFor={id} {...props.labelProps}></Label>
      {Custom ?? (
        <Input id={id} {...props.inputProps} aria-describedby={describedBy} />
      )}
      <OutputField_v2
        id={describedBy}
        helper={props.helper}
        errors={props.errors}
      />
    </div>
  );
}

export function TextareaField(props: {
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  textareaProps: React.InputHTMLAttributes<HTMLTextAreaElement>;
  errors?: string[];
  helper?: string;
  className?: string;
}) {
  const fallbackId = useId();
  const id = props.textareaProps.id ?? fallbackId;
  const errorId = props.errors?.length ? `${id}-error` : undefined;
  const helperId = props.helper ? `${id}-helper` : undefined;
  const describedBy = errorId ?? helperId;
  return (
    <div
      className={cn("flex flex-col gap-2", props.className)}
      style={{ marginBottom: Boolean(describedBy) ? "0" : "-0.5rem" }}
    >
      <Label htmlFor={id} {...props.labelProps}></Label>
      <Textarea
        id={id}
        aria-describedby={describedBy}
        {...props.textareaProps}
      />
      <OutputField_v2
        id={describedBy}
        helper={props.helper}
        errors={props.errors}
      />
    </div>
  );
}

export function ErrorField(props: {
  id?: string;
  errors?: string[];
  className?: string;
}) {
  const fallbackId = useId();
  const id = props.id ?? fallbackId;
  const hasErrors = Boolean(props.errors?.length);
  const [mounted, setMounted] = useState(false);
  const [refSpacer, { height: spacerHeight }] = useMeasure({
    offsetSize: true,
  });
  useEffect(() => setMounted(true), []);
  return (
    <motion.div
      aria-hidden={!hasErrors}
      // initial={{ }}
      animate={{
        height:
          !mounted || (mounted && spacerHeight === 0 && hasErrors)
            ? undefined
            : spacerHeight,
        opacity: hasErrors ? 1 : 0,
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(props.className)}
    >
      <AnimatePresence mode="wait">
        <motion.div key={`${id}-${hasErrors}`} ref={refSpacer}>
          <Alert
            id={id}
            variant="destructive"
            style={{ display: !hasErrors ? "none" : undefined }}
          >
            <AlertCircleIcon />
            <AlertTitle>Something went wrong.</AlertTitle>
            <AlertDescription>
              <ul className="list-inside list-disc text-sm">
                {props.errors?.map((error) => (
                  <li key={error} className="text-destructive">
                    {error}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

export function OutputField_v2(props: {
  id?: string;
  helper?: string;
  errors?: string[];
}) {
  let { helper, errors } = props;
  let hasErrors = Boolean(errors && errors.length > 0);
  let hasContent = Boolean(hasErrors || helper);
  let helperKey = helper?.split(" ").join("-") ?? "no-helper";
  let errorsKey =
    errors?.map((e) => e.split(" ").join("-")).join(",") ?? "no-errors";
  const [refSpacer, { height: spacerHeight }] = useMeasure({
    offsetSize: true,
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <motion.output
      id={props.id}
      aria-hidden={!hasContent}
      className="grid relative text-sm"
    >
      <motion.div
        aria-hidden="true"
        animate={{
          height:
            !mounted || (mounted && spacerHeight === 0 && hasContent)
              ? undefined
              : spacerHeight,
        }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
        className="invisible"
        data-spacer
      >
        <AnimatePresence mode="wait">
          <motion.div key={`${helperKey}-${errorsKey}`} ref={refSpacer}>
            <HelperContent helper={props.helper} stop={hasErrors} />
            <ErrorsContent errors={props.errors} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <AnimatePresence initial={false}>
        <motion.div
          key={`${helperKey}-${helper}-${!hasErrors}`}
          className="absolute inset-x-0 top-0 text-muted-foreground"
          initial={{ y: "-50%", opacity: 1, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "50%", opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <HelperContent helper={helper} stop={hasErrors} />
        </motion.div>
      </AnimatePresence>
      <AnimatePresence initial={false}>
        <motion.div
          key={`${errorsKey}-${hasErrors}`}
          className="absolute inset-x-0 top-0 text-destructive"
          initial={{ y: "-50%", opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "50%", opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <ErrorsContent errors={errors} />
        </motion.div>
      </AnimatePresence>
    </motion.output>
  );
}

function ErrorsContent(props: { errors?: string[] }) {
  if (!Boolean(props.errors?.length)) return null;
  return (
    <div className="flex items-start gap-2">
      <span className="py-1">
        <TriangleAlert className="size-3 shrink-0" />
      </span>
      <ul className="min-w-0">
        {props.errors!.map((error) => (
          <li key={error}>
            <p>{error}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HelperContent(props: { helper?: string; stop: boolean }) {
  if (!props.helper || props.stop) return null;
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1 inline-block">
        <Info className="size-3 shrink-0" />
      </span>
      <p>{props.helper}</p>
    </div>
  );
}

export function HelperField(props: {
  id?: string;
  helper?: string;
  className?: string;
}) {
  if (!props.helper) return null;

  return (
    <output
      id={props.id}
      className={cn(
        "text-muted-foreground text-sm flex items-baseline gap-2",
        props.className
      )}
    >
      <Info className="size-3 shrink-0" />
      <span>{props.helper}</span>
    </output>
  );
}

export function ErrorList(props: {
  errors?: string[];
  id?: string;
  mockErrors?: string[];
}) {
  let errors = props.errors ?? props.mockErrors;
  if (!errors || errors.length === 0) return null;

  return (
    <output
      id={props.id}
      role="alert"
      className="text-destructive text-sm flex gap-2 items-baseline"
    >
      <TriangleAlert className="size-3 shrink-0" />
      <ul className="flex-1">
        {errors.map((e) => (
          <li key={e} title={e} className="truncate">
            {e}
          </li>
        ))}
      </ul>
    </output>
  );
}
