'use client';

import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import React, { useState } from 'react';


export default function GaryAuto() {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-2xl">
        {authMode === 'signin' ? (
          <SignInForm onSwitchMode={() => setAuthMode('signup')} />
        ) : (
          <SignUpForm onSwitchMode={() => setAuthMode('signin')} />
        )}
      </div>
    </div>
  );
}
