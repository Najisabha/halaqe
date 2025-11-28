import * as React from "react";

export function Table({ className = "", ...props }) {
  return (
    <div className="w-full overflow-auto">
      <table
        className={`w-full caption-bottom text-sm border border-gray-200 rounded-md ${className}`}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className = "", ...props }) {
  return <thead className={`bg-gray-100 ${className}`} {...props} />;
}

export function TableBody({ className = "", ...props }) {
  return <tbody className={className} {...props} />;
}

export function TableRow({ className = "", ...props }) {
  return (
    <tr
      className={`border-b last:border-0 transition-colors hover:bg-gray-50 ${className}`}
      {...props}
    />
  );
}

export function TableHead({ className = "", ...props }) {
  return (
    <th
      className={`px-4 py-2 text-left font-medium text-gray-600 ${className}`}
      {...props}
    />
  );
}

export function TableCell({ className = "", ...props }) {
  return (
    <td
      className={`px-4 py-2 align-middle text-gray-800 ${className}`}
      {...props}
    />
  );
}
