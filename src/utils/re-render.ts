import { useEffect, useState } from "react";

export function useReRender(interval: number = 60000): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date()); // update to current time
    }, interval);

    return () => clearInterval(id);
  }, [interval]);

  return now;
}
