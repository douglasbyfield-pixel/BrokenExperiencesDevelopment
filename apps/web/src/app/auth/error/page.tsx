"use client";

import { Button } from "@web/components/ui/button";
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h1>
          <p className="text-gray-600">
            Something went wrong during the sign-in process. Please try again.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/login">
            <Button className="w-full bg-black text-white hover:bg-gray-800">
              Try Again
            </Button>
          </Link>
          
          <Link href="/home">
            <Button variant="outline" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>If this problem persists, please contact support.</p>
        </div>
      </div>
    </div>
  );
}