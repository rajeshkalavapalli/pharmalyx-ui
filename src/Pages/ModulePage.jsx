import { Box, Typography } from '@mui/material';

function ModulePage({ title }) {
  return (
    <Box>
      <Typography variant="h4" color="text.primary">
        {title}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        This module is ready for development.
      </Typography>
    </Box>
  );
}

export default ModulePage;
