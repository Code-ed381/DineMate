import React from "react";
import { Fab, Tooltip } from "@mui/material";
import Add from "@mui/icons-material/Add";

interface FABProps {
  handleAdd: () => void;
  title: string;
}

const FAB: React.FC<FABProps> = ({ handleAdd, title }) => {
    return (
        <Tooltip title={title}>
            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: "fixed", bottom: 24, right: 24 }}
                onClick={handleAdd}
            >
                <Add />
            </Fab>
        </Tooltip>
    );
};

export default FAB;
