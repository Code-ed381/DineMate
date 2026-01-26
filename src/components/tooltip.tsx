import React from "react";
import { Tooltip } from "@mui/material";

interface TooltipComponentProps {
  title: string;
  children: React.ReactElement;
}

const TooltipComponent: React.FC<TooltipComponentProps> = ({ title, children }) => {
    return (
        <Tooltip title={title}>
            <span>{children}</span>
        </Tooltip>
    );
};

export default TooltipComponent;
