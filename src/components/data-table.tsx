import * as React from "react";
import { DataGrid, GridToolbar, GridColDef, GridRowIdGetter, GridRowParams } from "@mui/x-data-grid";
import { SxProps, Theme } from "@mui/material";

interface DataTableProps {
  rows: any[];
  columns: GridColDef[];
  getRowId?: GridRowIdGetter;
  onRowClick?: (params: GridRowParams) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  showToolbar?: boolean;
  autoHeight?: boolean;
  sx?: SxProps<Theme>;
}

const DataTable: React.FC<DataTableProps> = ({
  rows,
  columns,
  getRowId,
  onRowClick,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20],
  showToolbar = false,
  autoHeight = true,
  sx = {},
}) => {
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
      sx={{
        borderRadius: 1,
        backgroundColor: "background.paper",
        "& .MuiDataGrid-columnHeaders": { fontWeight: "bold" },
        ...sx,
      }}
      slots={showToolbar ? { toolbar: GridToolbar } : {}}
      slotProps={showToolbar ? { toolbar: { showQuickFilter: true } } : {}}
    />
  );
};

export default DataTable;
