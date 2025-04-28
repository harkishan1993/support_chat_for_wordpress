import { Box, IconButton, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { memo } from "react";

const VoicePreview = ({ voiceFile, setVoiceFile }) => {
  if (!voiceFile) return null;
  const urlDefine = URL.createObjectURL(voiceFile)
  return (
    <Box className="px-4 py-3 mb-2 gap-2 w-5/6 md:w-[450px] flex  md:flex-row md:items-center md:justify-between bg-white border border-gray-300 rounded-xl shadow-sm">
      <Box className="flex flex-col md:flex-row md:items-center gap-2 w-full">
        <Box className="bg-gray-100 rounded-lg px-3 py-2 w-full">
          <audio
            controls
            src={urlDefine}
            className="w-full" // Ensures audio player fits within the box
          />
        </Box>
      </Box>

      <Tooltip title="Remove">
        <IconButton onClick={() => setVoiceFile(null)} color="error" size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>

  );
};

export default memo(VoicePreview);
