import React from "react";
import { Box, FormControlLabel, Switch } from "@mui/material";

interface AutoLayoutToggleProps {
  autoLayout: boolean;
  onAutoLayoutToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const AutoLayoutToggle: React.FC<AutoLayoutToggleProps> = ({
  autoLayout,
  onAutoLayoutToggle,
}) => (
  <Box sx={{ px: 2, py: 1 }}>
    <FormControlLabel
      control={
        <Switch
          checked={autoLayout}
          onChange={onAutoLayoutToggle}
          color="primary"
        />
      }
      label="Auto-Layout"
    />
  </Box>
);

export default AutoLayoutToggle;
