import React from "react";

export default function Input(props) {
  return (
    <input
      {...props}
      className="border border-gray-300 rounded-lg px-3 py-2 w-full"
    />
  );
}
