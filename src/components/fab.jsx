import { Fab, Tooltip } from "@mui/material";
import Add from "@mui/icons-material/Add";

export default function FAB({ handleAdd, title }) {
    return (
        <Tooltip title={title}>
            <Fab
                color="primary"
                aria-label="add table"
                sx={{ position: "fixed", bottom: 24, right: 24 }}
                onClick={handleAdd}
            >
                <Add />
            </Fab>
        </Tooltip>
    );
}