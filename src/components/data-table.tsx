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
  slots?: any;
  slotProps?: any;
  loading?: boolean;
  pagination?: boolean;
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
  slots,
  slotProps,
  loading,
  pagination,
}) => {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      autoHeight={autoHeight}
      loading={loading}
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
      slots={{ toolbar: showToolbar ? GridToolbar : undefined, ...slots }}
      slotProps={{
        toolbar: showToolbar ? { showQuickFilter: true } : undefined,
        ...slotProps,
      }}
    />
  );
};

export default DataTable;
