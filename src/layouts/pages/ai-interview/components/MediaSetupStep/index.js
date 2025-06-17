// components/MediaSetupStep.js
import React, { useRef, useEffect } from 'react';
import {
  Box, Typography, Button, Grid
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function MediaSetupStep({ 
  mediaState, 
  setMediaState, 
  chimeState,
  isConnected,
  setError,
  setSuccess,
  setOpenSnackbar,
  onNextStep 
}) {
  // Refs
  const localVideoRef = useRef(null);
  const audioLevelIndicatorRef = useRef(null);

  // Update video element when stream changes
  useEffect(() => {
    if (mediaState.videoTestStream && localVideoRef.current) {
      localVideoRef.current.srcObject = mediaState.videoTestStream;
    }
  }, [mediaState.videoTestStream]);

  // Update media ready state
  const updateMediaReadyState = () => {
    const ready = mediaState.audioReady || mediaState.audioEnabled;
    setMediaState(prev => ({ ...prev, mediaReady: ready }));
    console.log("Media ready state updated:", { audioReady: mediaState.audioReady, audioEnabled: mediaState.audioEnabled, ready });
  };

  // Get video device with robust error handling
  const getVideoDevice = async () => {
    try {
      console.log("[Video Debug] Checking camera availability...");
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }

      // Check for camera permissions
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' });
        console.log("[Video Debug] Camera permission status:", permissionStatus.state);
        
        if (permissionStatus.state === 'denied') {
          throw new Error('Camera access denied by user');
        }
      } catch (permError) {
        console.warn("[Video Debug] Permission query failed:", permError);
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      if (videoDevices.length === 0) {
        throw new Error('No camera devices found on this system');
      }

      // Try different constraint levels
      const constraintLevels = [
        { video: true, audio: false },
        {
          video: {
            deviceId: videoDevices[0].deviceId,
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        },
        {
          video: {
            deviceId: videoDevices[0].deviceId,
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          },
          audio: false
        }
      ];

      let lastError = null;
      
      for (let i = 0; i < constraintLevels.length; i++) {
        try {
          console.log(`[Video Debug] Trying constraint level ${i + 1}`);
          const stream = await navigator.mediaDevices.getUserMedia(constraintLevels[i]);
          
          const videoTracks = stream.getVideoTracks();
          if (videoTracks.length === 0) {
            stream.getTracks().forEach(track => track.stop());
            throw new Error('No video tracks in returned stream');
          }
          
          console.log("[Video Debug] Video stream obtained successfully");
          return stream;
        } catch (constraintError) {
          console.warn(`[Video Debug] Constraint level ${i + 1} failed:`, constraintError);
          lastError = constraintError;
          
          if (constraintError.name === 'NotAllowedError' || 
              constraintError.name === 'PermissionDeniedError') {
            throw new Error('Camera access denied by user. Please allow camera access and try again.');
          }
        }
      }
      
      throw lastError || new Error('Failed to access camera with any constraint level');
      
    } catch (error) {
      console.error("[Video Debug] Error getting video device:", error);
      
      if (error.name === 'NotFoundError' || error.message.includes('No camera devices')) {
        throw new Error('No camera found. Interview will continue in audio-only mode.');
      } else if (error.name === 'NotAllowedError' || error.message.includes('denied')) {
        throw new Error('Camera access denied. Please allow camera access in your browser settings.');
      } else if (error.name === 'NotReadableError') {
        throw new Error('Camera is in use by another application. Please close other applications using the camera.');
      } else if (error.name === 'OverconstrainedError') {
        throw new Error('Camera does not meet the required specifications. Interview will continue in audio-only mode.');
      } else {
        throw new Error(`Camera error: ${error.message || 'Unknown camera error'}. Interview will continue in audio-only mode.`);
      }
    }
  };

  // Handle audio toggle
  const handleAudioToggle = async () => {
    if (mediaState.audioEnabled) {
      // Disable audio
      if (mediaState.audioTestStream) {
        mediaState.audioTestStream.getTracks().forEach(track => track.stop());
      }
      if (audioLevelIndicatorRef.current) {
        audioLevelIndicatorRef.current.style.width = '0%';
      }
      setMediaState(prev => ({
        ...prev,
        audioEnabled: false,
        audioReady: false,
        audioTestStream: null
      }));
    } else {
      // Enable audio
      try {
        console.log("🎤 Testing audio input...");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000,
            channelCount: 1
          }
        });

        // Create audio context for level monitoring
        const context = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 16000
        });

        // Set up audio level monitoring
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        // Start level monitoring
        const monitorLevels = () => {
          if (analyser && mediaState.audioEnabled) {
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);
            
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = (sum / dataArray.length) * 2; // Scale up for visibility

            if (audioLevelIndicatorRef.current) {
              audioLevelIndicatorRef.current.style.width = `${Math.min(100, average)}%`;
            }
            
            if (mediaState.audioEnabled) {
              requestAnimationFrame(monitorLevels);
            }
          }
        };

        setMediaState(prev => ({
          ...prev,
          audioEnabled: true,
          audioReady: true,
          audioTestStream: stream
        }));
        
        monitorLevels();
        console.log("✅ Audio input ready");
        
      } catch (error) {
        console.error("❌ Audio setup failed:", error);
        setError(`Audio setup failed: ${error.message}`);
        setOpenSnackbar(true);
      }
    }
    
    updateMediaReadyState();
  };

  // Handle video toggle
  const handleVideoToggle = async () => {
    if (mediaState.cameraEnabled) {
      // Disable video
      if (mediaState.videoTestStream) {
        mediaState.videoTestStream.getTracks().forEach(track => track.stop());
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      setMediaState(prev => ({
        ...prev,
        cameraEnabled: false,
        videoReady: false,
        videoTestStream: null
      }));
    } else {
      // Enable video
      try {
        console.log("📹 Testing video input...");
        const stream = await getVideoDevice();
        
        // Set video to preview element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        setMediaState(prev => ({
          ...prev,
          cameraEnabled: true,
          videoReady: true,
          videoTestStream: stream
        }));
        
        console.log("✅ Video input ready");
      } catch (error) {
        console.error("❌ Video setup failed:", error);
        console.log("📱 Continuing without video - audio-only mode");
        
        // Don't show error for video - it's optional
        setMediaState(prev => ({
          ...prev,
          videoReady: false,
          cameraEnabled: false
        }));
      }
    }
    
    updateMediaReadyState();
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" mb={3}>
        Step 1: Media Setup & Testing
      </Typography>
      
      <Grid container spacing={3}>
        {/* Left Column - Controls */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Test Your Devices
            </Typography>
            
            {/* Audio Control */}
            <Box mb={3}>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Button
                  variant={mediaState.audioEnabled ? "contained" : "outlined"}
                  color={mediaState.audioEnabled ? "success" : "primary"}
                  onClick={handleAudioToggle}
                  startIcon={<MicIcon />}
                  fullWidth
                >
                  {mediaState.audioEnabled ? "Audio: ON" : "Enable Audio"}
                </Button>
                
                {mediaState.audioReady && (
                  <CheckCircleIcon color="success" />
                )}
              </Box>
              
              {/* Audio level indicator */}
              {mediaState.audioEnabled && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Audio Level (speak to test):
                  </Typography>
                  <Box width="100%" height="12px" bgcolor="#eee" borderRadius="6px" mt={1}>
                    <Box 
                      height="100%" 
                      width="0%" 
                      bgcolor="#4CAF50"
                      borderRadius="6px"
                      ref={audioLevelIndicatorRef}
                      sx={{ transition: 'width 0.1s' }}
                    />
                  </Box>
                </Box>
              )}
            </Box>

            {/* Video Control */}
            <Box mb={3}>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Button
                  variant={mediaState.cameraEnabled ? "contained" : "outlined"}
                  color={mediaState.cameraEnabled ? "success" : "primary"}
                  onClick={handleVideoToggle}
                  startIcon={mediaState.cameraEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                  fullWidth
                >
                  {mediaState.cameraEnabled ? "Camera: ON" : "Enable Camera"}
                </Button>
                
                {mediaState.videoReady && (
                  <CheckCircleIcon color="success" />
                )}
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                Camera is optional - you can continue with audio only
              </Typography>
            </Box>

            {/* Connection Status */}
            <Box mb={3} p={2} bgcolor="#f5f5f5" borderRadius="8px">
              <Typography variant="subtitle2" mb={1}>
                Connection Status
              </Typography>
              <Typography 
                variant="body2" 
                color={isConnected ? "success.main" : "error.main"}
                fontWeight="bold"
              >
                {isConnected ? "✓ Connected to AI Interview System" : "⚠ Not Connected"}
              </Typography>
            </Box>

            {/* Instructions */}
            <Box p={2} bgcolor="#e3f2fd" borderRadius="8px">
              <Typography variant="subtitle2" mb={1} color="primary">
                Setup Instructions:
              </Typography>
              <Typography variant="body2" component="div">
                <ol style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Click "Enable Audio" and grant microphone access</li>
                  <li>Speak to test your microphone level</li>
                  <li>Optionally enable your camera for video</li>
                  <li>Click "Continue to Interview" when ready</li>
                </ol>
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Right Column - Video Preview */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Preview
            </Typography>
            
            <Box 
              width="100%" 
              height="300px" 
              border="2px solid #ddd" 
              borderRadius="12px"
              overflow="hidden"
              bgcolor={!mediaState.cameraEnabled ? "#f5f5f5" : undefined}
              position="relative"
            >
              {mediaState.cameraEnabled ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    backgroundColor: '#000'
                  }}
                />
              ) : (
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                  textAlign="center"
                  p={3}
                >
                  <VideocamOffIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" mb={1}>
                    {mediaState.audioReady ? 
                      "Audio-only mode" : 
                      "Enable your devices above"
                    }
                  </Typography>
                  {mediaState.audioReady && (
                    <Typography variant="body2" color="text.secondary">
                      Your interview will work perfectly with just audio
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {/* Media Status */}
            <Box mt={2} p={2} bgcolor="#f9f9f9" borderRadius="8px">
              <Typography variant="subtitle2" mb={1}>
                Media Status:
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Typography 
                  variant="body2" 
                  color={mediaState.audioReady ? "success.main" : "text.secondary"}
                >
                  🎤 Audio: {mediaState.audioReady ? "Ready" : "Not enabled"}
                </Typography>
                <Typography 
                  variant="body2" 
                  color={mediaState.videoReady ? "success.main" : "text.secondary"}
                >
                  📹 Video: {mediaState.videoReady ? "Ready" : "Not enabled"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Continue Button */}
      <Box mt={4} textAlign="center">
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onNextStep}
          disabled={!mediaState.mediaReady || !isConnected}
          endIcon={<ArrowForwardIcon />}
          sx={{ minWidth: 200 }}
        >
          Continue to Interview
        </Button>
        
        {!mediaState.mediaReady && (
          <Typography variant="body2" color="text.secondary" mt={1}>
            Please enable audio to continue
          </Typography>
        )}
        
        {!isConnected && (
          <Typography variant="body2" color="error" mt={1}>
            Waiting for connection to AI system...
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default MediaSetupStep;