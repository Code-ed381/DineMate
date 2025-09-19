import { Tooltip } from "@mui/material";

export default function TooltipComponent({ title, children }) {
    return (
        <Tooltip title={title}>
            <span>{children}</span>
        </Tooltip>
    );
}