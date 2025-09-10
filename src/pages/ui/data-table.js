import * as React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

export default function DataTable({
  rows,
  columns,
  getRowId,
  onRowClick,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20],
  showToolbar = false,
  autoHeight = true,
  sx = {},
}) {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      autoHeight={autoHeight}
      getRowId={getRowId}
      onRowClick={onRowClick}
      disableRowSelectionOnClick
      initialState={{
        pagination: { paginationModel: { pageSize } },
      }}
      pageSizeOptions={pageSizeOptions}
      sortingOrder={["asc", "desc"]}
      sx={{
        borderRadius: 1,
        backgroundColor: "background.paper",
        "& .MuiDataGrid-columnHeaders": { fontWeight: "bold" },
        ...sx,
      }}
      components={showToolbar ? { Toolbar: GridToolbar } : {}}
      componentsProps={
        showToolbar
          ? {
              toolbar: { showQuickFilter: true },
            }
          : {}
      }
    />
  );
}