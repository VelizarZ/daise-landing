"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import AppCatalog from "./components/AppCatalog";

export default function Component() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Data & AI Demo Catalog</h1>
        <p className="mb-4">Please sign in to access the demo catalog.</p>
        <button
          onClick={() => signIn()}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Data & AI Demo Catalog</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Signed in as {session.user?.email}</span>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Sign Out
          </button>
        </div>
      </nav>
      <AppCatalog />
    </div>
  );
}
