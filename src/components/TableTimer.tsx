import React, { useState, useEffect } from 'react';
import { Chip, Tooltip } from '@mui/material';
import { Schedule } from '@mui/icons-material';

interface TableTimerProps {
  startDate: string;
}

const TableTimer: React.FC<TableTimerProps> = ({ startDate }) => {
  const [elapsed, setElapsed] = useState<string>('00:00');
  const [color, setColor] = useState<'success' | 'warning' | 'error'>('success');

  useEffect(() => {
    const calculateTime = () => {
      if (!startDate) return;
      const start = new Date(startDate).getTime();
      const now = new Date().getTime();
      const diffInMs = now - start;
      
      // Handle potential negative diff if system clocks are slightly off
      const absDiffInMs = Math.max(0, diffInMs);
      const seconds = Math.floor((absDiffInMs / 1000) % 60);
      const diffInMinutes = Math.floor(absDiffInMs / 60000);
      
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      
      let formattedTime = "";
      if (hours > 0) {
        formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      setElapsed(formattedTime);

      if (diffInMinutes < 60) {
        setColor('success');
      } else if (diffInMinutes < 120) {
        setColor('warning');
      } else {
        setColor('error');
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000); // Update every second

    return () => clearInterval(interval);
  }, [startDate]);

  if (!startDate) return null;

  return (
    <Tooltip title="Time since session started">
      <Chip
        icon={<Schedule sx={{ fontSize: '1rem !important' }} />}
        label={elapsed}
        size="small"
        color={color}
        variant="outlined"
        sx={{ 
          fontWeight: 'bold',
          height: '24px',
          '& .MuiChip-label': { px: 1 }
        }}
      />
    </Tooltip>
  );
};

export default TableTimer;
