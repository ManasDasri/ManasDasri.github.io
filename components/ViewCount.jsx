'use client';

import { useEffect, useState } from 'react';

// Total site views from GoatCounter's public counter. Hidden until it loads, or if it never does.
export default function ViewCount() {
  const [count, setCount] = useState(null);
  useEffect(() => {
    fetch('https://manas049.goatcounter.com/counter/TOTAL.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.count && setCount(d.count))
      .catch(() => {});
  }, []);
  if (!count) return null;
  return <span>{count} views</span>;
}
