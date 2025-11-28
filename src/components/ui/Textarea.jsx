// src/components/ui/Textarea.jsx

import React, { forwardRef, useId, useState } from "react";
import clsx from "clsx";

const Textarea = forwardRef(
  ({ label, error, className, showCount = false, ...props }, ref) => {
    const id = useId();
    const [value, setValue] = useState(props.defaultValue ?? "");

    const handleChange = (e) => {
      setValue(e.target.value);
      if (props.onChange) props.onChange(e);
    };

    return (
      <div className={clsx("textarea-wrapper", className)}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium mb-1">
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={ref}
          className={clsx(
            "resize-y block w-full rounded-md border px-3 py-2 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:border-primary focus:ring-primary/50"
          )}
          {...props}
          value={value}
          onChange={handleChange}
        />
        {showCount && (
          <div className="text-sm text-gray-500 mt-1">
            {value.length}
            {props.maxLength ? ` / ${props.maxLength}` : ""}
          </div>
        )}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
