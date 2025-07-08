import { SignUp } from "@clerk/nextjs";
import React from "react";

export default function Page() {
  return (
    <div>
      <div className="flex items-center justify-center p-3">
        <SignUp />
      </div>
    </div>
  );
}
