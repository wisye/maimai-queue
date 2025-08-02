import React from "react";

export default function Button({ children, ...props }) {
  return (
    <button
      {...props}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
    >
      {children}
    </button>
  );
}
