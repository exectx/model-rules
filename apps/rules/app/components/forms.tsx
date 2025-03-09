import { useField, useInputControl } from "@conform-to/react";
import { Checkbox } from "./ui/checkbox";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { Info, TriangleAlert } from "lucide-react";
// import type { CheckboxProps as RadixCheckboxProps } from "@radix-ui/react-checkbox";

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
  errors?: string[];
  info?: React.ReactNode;
}) {
  if (!props.errors && !props.info) return null;

  return (
    <div
      className={cn("text-sm text-muted-foreground", {
        "text-destructive-foreground": Boolean(props.errors),
      })}
    >
      <output className="flex items-start gap-2">
        {props.errors ? (
          <TriangleAlert className="size-3 mt-[3px] shrink-0" />
        ) : (
          <Info className="size-3 mt-[3px] shrink-0" />
        )}
        {props.errors ? (
          <span>{props.errors.join(", ")}</span>
        ) : typeof props.info === "string" ? (
          <span>{props.info}</span>
        ) : (
          props.info
        )}
      </output>
    </div>
  );
}
