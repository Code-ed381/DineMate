import { useEffect, useState } from "react";

export function useReRender(interval = 60000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date()); // update to current time
    }, interval);

    return () => clearInterval(id);
  }, [interval]);

  return now;
}