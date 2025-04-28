import { Button, Card, CardContent, IconButton, Typography, Box } from '@mui/material';
import React, { memo } from 'react'
import CloseIcon from "@mui/icons-material/Close";
function FileSelectedViews({files, clearFiles, removeFile}) {
    return (
        <Box className="px-4 mb-2 flex flex-wrap gap-3 justify-start">
            {files.map((file, idx) => {
                const fileUrl = URL.createObjectURL(file);
                const fileExt = file.name.split('.').pop()?.toUpperCase();
                const isImage = file.type.startsWith("image/");
                const isAudio = file.type.startsWith("audio/");
                const isVideo = file.type.startsWith("video/");

                return (
                    <Card key={idx} sx={{ width: 120, px: 1, py: 2, position: "relative", display: "flex", flexDirection: "column" }}>
                        <IconButton
                            size="small"
                            onClick={() => removeFile(idx)}
                            sx={{ position: "absolute", top: 4, right: 4, zIndex: 10, bgcolor:"ButtonFace" }}
                            color="error"
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                        <CardContent sx={{ p: 0, textAlign: "center" }}>
                            {isImage ? (
                                <img
                                    src={fileUrl}
                                    alt={file.name}
                                    style={{
                                        maxWidth: "100%",
                                        objectFit: "cover",
                                        borderRadius: "6px",
                                    }}
                                />
                            ) : isAudio ? (
                                <audio
                                    controls
                                    controlsList="nodownload noplaybackrate nofullscreen"
                                    onContextMenu={(e) => e.preventDefault()}
                                    style={{ width: "100%" }}
                                    src={fileUrl}
                                />
                            ) : isVideo ? (
                                <video
                                    controls
                                    controlsList="nodownload noplaybackrate nofullscreen"
                                    onContextMenu={(e) => e.preventDefault()}
                                    style={{ width: "100%", borderRadius: "6px" }}
                                    src={fileUrl}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        width: "100%",
                                        height: 70,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: "grey.100",
                                        borderRadius: "6px",
                                    }}
                                >
                                    <Typography variant="body2" fontWeight="bold">
                                        {fileExt}
                                    </Typography>
                                </Box>
                            )}
                            <Typography
                                variant="caption"
                                noWrap
                                title={file.name}
                                sx={{ mt: 0.5, display: "block" }}
                            >
                                {file.name}
                            </Typography>
                        </CardContent>
                    </Card>
                );
            })}
            <Button size="small"  variant="outlined" color="error" onClick={clearFiles}>
                Clear All
            </Button>
        </Box>
    )
}

export default memo(FileSelectedViews)