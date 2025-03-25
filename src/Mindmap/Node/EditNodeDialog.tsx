/** @format */
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from "@mui/material";
import { NodeData } from "../types";
import { useNodeEditForm } from "./hooks/useNodeEditForm";

interface EditNodeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (updates: Partial<NodeData>) => void;
  nodeData: NodeData;
}

export const EditNodeDialog = ({
  open,
  onClose,
  onSave,
  nodeData,
}: EditNodeDialogProps) => {
  const { formData, isValid, updateField, handleSave, handleKeyDown } =
    useNodeEditForm({
      open,
      nodeData,
      onSave,
      onClose,
    });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      onKeyDown={handleKeyDown}
    >
      <DialogTitle>Edit Node</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            label="Label"
            fullWidth
            value={formData.label || ""}
            onChange={(e) => updateField("label", e.target.value)}
            error={!formData.label?.trim()}
            helperText={!formData.label?.trim() ? "Label is required" : ""}
          />

          <FormControl fullWidth>
            <InputLabel>Difficulty Level</InputLabel>
            <Select
              value={formData.nodeLevel || "basic"}
              label="Difficulty Level"
              onChange={(e) => updateField("nodeLevel", e.target.value)}
            >
              <MenuItem value="basic">Basic</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Details"
            fullWidth
            multiline
            rows={4}
            value={formData.details || ""}
            onChange={(e) => updateField("details", e.target.value)}
            error={formData.details !== undefined && !formData.details.trim()}
            helperText={
              formData.details !== undefined && !formData.details.trim()
                ? "Details cannot be empty if provided"
                : ""
            }
          />

          <Typography variant="caption" color="text.secondary">
            Press Ctrl/⌘ + Enter to save
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={!isValid}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
