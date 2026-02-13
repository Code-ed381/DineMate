import React, { useState, useRef } from 'react';
import { Box, Paper, Typography, Tooltip, Zoom, Fab, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Close as CloseIcon,
  Restaurant as RestaurantIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { RestaurantTable } from '../lib/tablesStore';

import TableTimer from './TableTimer';

interface FloorPlanProps {
  tables: RestaurantTable[];
  sessionsOverview?: any[];
  serviceRequests?: any[];
  onTableClick: (table: RestaurantTable) => void;
  onUpdatePosition: (id: string, x: number, y: number) => Promise<void>;
  onCancelReservation?: (table: RestaurantTable) => void;
}

const FloorPlan: React.FC<FloorPlanProps> = ({ tables, sessionsOverview, serviceRequests, onTableClick, onUpdatePosition, onCancelReservation }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempPositions, setTempPositions] = useState<Record<string, { x: number, y: number }>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrag = (id: string, deltaX: number, deltaY: number) => {
    setTempPositions(prev => {
      const current = prev[id] || { 
        x: tables.find(t => t.id === id)?.x_position || 0, 
        y: tables.find(t => t.id === id)?.y_position || 0 
      };
      return {
        ...prev,
        [id]: { x: current.x + deltaX, y: current.y + deltaY }
      };
    });
  };

  const savePositions = async () => {
    const promises = Object.entries(tempPositions).map(([id, pos]) => 
      onUpdatePosition(id, pos.x, pos.y)
    );
    await Promise.all(promises);
    setTempPositions({});
    setIsEditMode(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#4caf50';
      case 'occupied': return '#f44336';
      case 'reserved': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%', 
      height: 'calc(100vh - 300px)', 
      minHeight: 500,
      bgcolor: 'rgba(0,0,0,0.03)', 
      borderRadius: 4, 
      overflow: 'hidden', 
      border: '2px dashed', 
      borderColor: isEditMode ? 'primary.main' : 'divider',
      backgroundImage: 'radial-gradient(circle, #ccc 1px, transparent 1px)',
      backgroundSize: '30px 30px'
    }}>
      {/* Controls */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 1 }}>
        {isEditMode ? (
          <>
            <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={savePositions} sx={{ borderRadius: 2 }}>
              Save Layout
            </Button>
            <Button variant="outlined" color="inherit" startIcon={<CloseIcon />} onClick={() => { setIsEditMode(false); setTempPositions({}); }} sx={{ borderRadius: 2, bgcolor: 'background.paper' }}>
              Cancel
            </Button>
          </>
        ) : (
          <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={() => setIsEditMode(true)} sx={{ borderRadius: 2 }}>
            Edit Floor Plan
          </Button>
        )}
      </Box>

      {/* Floor Label */}
      <Box sx={{ position: 'absolute', bottom: 16, left: 16, opacity: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <RestaurantIcon fontSize="small" />
        <Typography variant="caption" fontWeight="bold">RESTAURANT FLOOR MAP</Typography>
      </Box>

      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
          {tables.map((table) => {
              const currentPos = tempPositions[table.id] || { 
                x: table.x_position || 50, 
                y: table.y_position || 50 
              };
              
              const statusColor = getStatusColor(table.status);
              const hasServiceRequest = serviceRequests?.some((r: any) => r.table_id === table.id && r.status === "pending");

              return (
                <motion.div
                  key={table.id}
                  drag={isEditMode}
                  dragMomentum={false}
                  onDrag={(e, info) => handleDrag(table.id, info.delta.x, info.delta.y)}
                  style={{
                    position: 'absolute',
                    left: currentPos.x,
                    top: currentPos.y,
                    cursor: isEditMode ? 'move' : 'pointer',
                    zIndex: isEditMode ? 100 : 1,
                    touchAction: 'none'
                  }}
                  onClick={() => !isEditMode && onTableClick(table)}
                >
                  <Tooltip title={isEditMode ? "Drag to reposition" : `Table ${table.table_number}`} TransitionComponent={Zoom} arrow>
                      <Paper
                        elevation={isEditMode ? 10 : 3}
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: table.shape === 'circle' ? '50%' : 3,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `4px solid ${statusColor}`,
                          bgcolor: 'background.paper',
                          position: 'relative',
                          transform: `rotate(${table.rotation || 0}deg)`,
                          transition: 'border-color 0.3s, box-shadow 0.3s',
                          boxShadow: hasServiceRequest 
                            ? "0 0 0 4px #d32f2f, 0 0 20px rgba(211, 47, 47, 0.6)" 
                            : (table.status === 'occupied' ? "0 4px 12px rgba(0,0,0,0.1)" : "none"),
                          '&:hover': {
                            boxShadow: isEditMode ? 20 : 6
                          }
                        }}
                      >
                        <Typography variant="h5" fontWeight="900" color="text.primary">
                          {table.table_number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          {table.capacity} SEATS
                        </Typography>

                        {/* Timer */}
                        {!isEditMode && table.status === 'occupied' && (() => {
                          const session = sessionsOverview?.find((s: any) => s.table_id === table.id);
                          return session?.opened_at ? (
                            <Box sx={{ mt: 0.5 }}>
                               <TableTimer startDate={session.opened_at} />
                            </Box>
                          ) : null;
                        })()}
                        
                        {/* Status Dot */}
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8, 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          bgcolor: statusColor,
                          boxShadow: `0 0 8px ${statusColor}`
                        }} />

                        {/* Cancel Reservation Button */}
                        {!isEditMode && table.status === 'reserved' && onCancelReservation && (
                          <Tooltip title="Cancel Reservation">
                            <Fab
                              size="small"
                              color="error"
                              sx={{
                                position: 'absolute',
                                bottom: -10,
                                right: -10,
                                width: 32,
                                height: 32,
                                minHeight: 32,
                                zIndex: 2
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onCancelReservation(table);
                              }}
                            >
                              <BlockIcon sx={{ fontSize: 16 }} />
                            </Fab>
                          </Tooltip>
                        )}
                      </Paper>
                  </Tooltip>
                </motion.div>
              );
          })}
      </div>
    </Box>
  );
};

export default FloorPlan;
