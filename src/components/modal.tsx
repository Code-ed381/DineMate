import * as React from "react";
import { Backdrop, Box, Modal, Fade, SxProps, Theme } from "@mui/material";

const style: SxProps<Theme> = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", md: "50%" },
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

interface TransitionsModalProps {
  open: boolean;
  handleClose: () => void;
  children: React.ReactNode;
}

const TransitionsModal: React.FC<TransitionsModalProps> = ({ open, handleClose, children }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={open}>
        <Box sx={style}>
          {children}
        </Box>
      </Fade>
    </Modal>
  );
};

export default TransitionsModal;
