"use client";

import { signIn, useSession } from "next-auth/react";

export default function TestLogin() {
  const { data } = useSession();

  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={() =>
          signIn("credentials", {
            email: "admin@loadsharepro.co.za",
            redirect: false,
          })
        }
      >
        Login
      </button>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
