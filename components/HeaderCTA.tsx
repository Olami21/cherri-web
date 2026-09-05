'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function HeaderCTA({
  className = '',
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loggedIn === null) {
    return null;
  }

  return loggedIn ? (
    <a href="/dashboard" className={className} onClick={onClick}>
      Dashboard
    </a>
  ) : (
    <a href="/#signup-section" className={className} onClick={onClick}>
      Join early access
    </a>
  );
}