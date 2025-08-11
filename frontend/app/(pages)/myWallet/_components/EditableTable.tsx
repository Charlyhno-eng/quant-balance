import React from "react";
import { Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

type EditableTableProps<T> = {
  title: string;
  data: T[];
  newItem: Partial<T>;
  onEdit: (index: number, field: keyof T, value: string) => void;
  onDelete: (index: number) => void;
  onAdd: () => void;
  onNewItemChange: (field: keyof T, value: string) => void;
  columns: { key: keyof T; label: string; type?: "text" | "number"; width?: string; }[];
};

export default function EditableTable<T extends object>({ title, data, newItem, onEdit, onDelete, onAdd, onNewItemChange, columns }: EditableTableProps<T>) {
  const textFieldSx = {
    input: { color: "white", textTransform: "uppercase" },
    "& .MuiInput-underline:before": { borderBottomColor: "rgba(255,255,255,0.7)" },
    "& .MuiInput-underline:hover:before": { borderBottomColor: "white" },
    "& .MuiInput-underline:after": { borderBottomColor: "white" },
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ color: "white", mb: 1 }}>{title}</Typography>
      <Paper sx={{ bgcolor: "rgba(10, 26, 51, 0.3)" }}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map(({ label, width }, i) => (
                <TableCell key={i} sx={{ color: "white", width }}>{label}</TableCell>
              ))}
              <TableCell align="right" sx={{ color: "white" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                {columns.map(({ key, type }, i) => (
                  <TableCell key={i} sx={{ color: "white" }}>
                    <TextField
                      variant="standard"
                      value={(item[key] ?? "") as string | number}
                      type={type ?? "text"}
                      onChange={(e) => onEdit(index, key, e.target.value)}
                      slotProps={{ input: { inputProps: type === "number" ? { min: 0 } : undefined, style: { color: "white", textTransform: "uppercase" } } }}
                      sx={textFieldSx}
                    />
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ color: "white" }}>
                  <IconButton onClick={() => onDelete(index)} color="error" size="small">
                    <DeleteIcon sx={{ color: "white" }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            <TableRow>
              {columns.map(({ key, type }, i) => (
                <TableCell key={i} sx={{ color: "white" }}>
                  <TextField
                    variant="standard"
                    placeholder={columns[i].label}
                    value={(newItem[key] ?? "") as string | number}
                    type={type ?? "text"}
                    onChange={(e) => onNewItemChange(key, e.target.value)}
                    slotProps={{ input: { inputProps: type === "number" ? { min: 0 } : undefined, style: { color: "white", textTransform: "uppercase" } } }}
                    sx={textFieldSx}
                  />
                </TableCell>
              ))}
              <TableCell align="right" sx={{ color: "white" }}>
                <IconButton onClick={onAdd} color="primary" size="small">
                  <AddIcon sx={{ color: "white" }} />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
