'use client';

import { useEffect } from 'react';

export default function AutoPrint() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500); // Small delay to ensure styles render

    return () => clearTimeout(timer);
  }, []);

  return null;
}
