import { useState } from "react";
import { Select, createStyles, rem } from "@mantine/core";
import {
  UseControllerProps,
  FieldValues,
  useController,
  UseFormReset,
} from "react-hook-form";

const useStyles = createStyles(
  (theme, { floating }: { floating: boolean }) => ({
    root: {
      position: "relative",
    },

    label: {
      position: "absolute",
      zIndex: 2,
      top: rem(7),
      left: theme.spacing.sm,
      pointerEvents: "none",
      color: floating
        ? theme.colorScheme === "dark"
          ? theme.white
          : theme.black
        : theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[5],
      transition:
        "transform 150ms ease, color 150ms ease, font-size 150ms ease",
      transform: floating
        ? `translate(-${theme.spacing.sm}, ${rem(-28)})`
        : "none",
      fontSize: floating ? theme.fontSizes.xs : theme.fontSizes.sm,
      fontWeight: floating ? 500 : 400,
    },

    required: {
      transition: "opacity 150ms ease",
      opacity: floating ? 1 : 0,
    },

    input: {
      "&::placeholder": {
        transition: "color 150ms ease",
        color: !floating ? "transparent" : undefined,
      },
    },
  }),
);

interface Option {
  value: string;
  label: string;
}

export function Dropdown({
  control,
  name,
  label,
  placeholder,
  options,
  onChange,
  rules,
}: UseControllerProps<FieldValues> & {
  label: string;
  placeholder?: string;
  // options:(string | SelectItem)[];
  options: Option[];
  onChange?: UseFormReset<FieldValues>;
}) {
  const { field, fieldState } = useController({
    name: name,
    control: control,
    rules: rules,
  });

  const [focused, setFocused] = useState(false);
  const { classes } = useStyles({
    floating: (field.value && focused) || focused,
  });

  const handleChange = (value: string | null) => {
    if (onChange) {
      onChange();
    }
    field.onChange(value);
  };

  return (
    <Select
      {...field}
      required
      classNames={classes}
      label={fieldState.error ? "" : label}
      placeholder={placeholder}
      data={options?.map((option) => {
        return {
          value: option.label,
          label: option.label,
        };
      })}
      error={fieldState.error && <span>{fieldState.error.message}</span>}
      errorProps={{
        root: "ErrorMessage",
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => !field.value && setFocused(false)}
      onChange={(event) => handleChange(event)}
    />
  );
}
