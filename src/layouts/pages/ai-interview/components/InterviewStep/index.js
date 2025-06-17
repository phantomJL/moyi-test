// components/InterviewStep.js
import React, { useRef, useEffect, useState } from 'react';
import {
  Box, Typography, Button, Grid, Dialog, DialogActions, 
  DialogContent, DialogContentText, DialogTitle, Paper, Chip
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

function InterviewStep({ 
  mediaState,
  setMediaState,
  interviewState,
  setInterviewState,
  chimeState,
  setChimeState,
  websocket,
  isConnected,
  currentMeeting,
  interviewEnded,
  audioDataBufferRef,
  isRecordingRef,
  setError,
  setSuccess,
  setOpenSnackbar,
  endMeeting,
  onPreviousStep,
  isLoading
}) {
  // Local state
  const [openEndDialog, setOpenEndDialog] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [silenceTimerRef, setSilenceTimerRef] = useState(null);

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef(null);
  const connectionStatusRef = useRef(null);
  const startRecordingBtnRef = useRef(null);

  // Update button states
  useEffect(() => {
    updateButtonStates();
  }, [interviewState.isRecording, isConnected, interviewState.isWaitingForAI, chimeState.videoEnabled, mediaState.mediaReady, isLoading]);

  // Setup video tile observers when Chime SDK is ready
  useEffect(() => {
    if (chimeState.audioVideo) {
      setupVideoTileObservers(chimeState.audioVideo);
    }
  }, [chimeState.audioVideo]);

  // Auto-scroll transcripts
  useEffect(() => {
    if (interviewState.transcripts.length > 0) {
      const transcriptContainer = document.getElementById('transcript-container');
      if (transcriptContainer) {
        transcriptContainer.scrollTop = transcriptContainer.scrollHeight;
      }
    }
  }, [interviewState.transcripts]);

  // Helper to update button states
  const updateButtonStates = () => {
    if (startRecordingBtnRef.current) {
      const shouldDisable = !isConnected || !mediaState.mediaReady || interviewState.isWaitingForAI || interviewEnded || isLoading;
      startRecordingBtnRef.current.disabled = shouldDisable;
    }
    
    if (connectionStatusRef.current) {
      if (interviewEnded) {
        connectionStatusRef.current.textContent = 'Interview Ended';
        connectionStatusRef.current.style.color = '#757575';
      } else if (interviewState.isRecording) {
        connectionStatusRef.current.textContent = 'Recording...';
        connectionStatusRef.current.style.color = '#f44336';
      } else if (interviewState.isWaitingForAI) {
        connectionStatusRef.current.textContent = 'Waiting for AI response...';
        connectionStatusRef.current.style.color = '#ff9800';
      } else if (isConnected && mediaState.mediaReady) {
        connectionStatusRef.current.textContent = 'Ready to start';
        connectionStatusRef.current.style.color = '#4caf50';
      } else if (!isConnected) {
        connectionStatusRef.current.textContent = 'Connecting...';
        connectionStatusRef.current.style.color = '#ff9800';
      } else {
        connectionStatusRef.current.textContent = 'Not Ready';
        connectionStatusRef.current.style.color = '#f44336';
      }
    }
  };

  // Setup video tile observers
  const setupVideoTileObservers = (av) => {
    console.log("Setting up video tile observers...");
    
    av.addObserver({
      videoTileDidUpdate: tileState => {
        console.log("Video tile updated:", tileState);
        
        if (!tileState.boundAttendeeId) {
          return;
        }
        
        if (tileState.localTile) {
          console.log(`Binding local video tile ${tileState.tileId}`);
          if (localVideoRef.current) {
            try {
              localVideoRef.current.autoplay = true;
              localVideoRef.current.muted = true;
              localVideoRef.current.playsInline = true;
              
              av.bindVideoElement(tileState.tileId, localVideoRef.current);
              console.log(`Successfully bound local video tile ${tileState.tileId}`);
            } catch (error) {
              console.error(`Error binding local video tile: ${error.message}`);
            }
          }
          return;
        }
        
        // Handle remote video tiles
        if (remoteVideosRef.current) {
          let videoElement = document.getElementById(`video-${tileState.tileId}`);
          
          if (!videoElement) {
            while (remoteVideosRef.current.firstChild) {
              remoteVideosRef.current.removeChild(remoteVideosRef.current.firstChild);
            }
            
            const videoContainer = document.createElement('div');
            videoContainer.className = 'video-item';
            videoContainer.id = `video-container-${tileState.tileId}`;
            videoContainer.style.width = '100%';
            videoContainer.style.height = '100%';
            
            videoElement = document.createElement('video');
            videoElement.id = `video-${tileState.tileId}`;
            videoElement.autoplay = true;
            videoElement.playsInline = true;
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';
            videoElement.style.objectFit = 'cover';
            
            videoContainer.appendChild(videoElement);
            remoteVideosRef.current.appendChild(videoContainer);
          }
          
          try {
            av.bindVideoElement(tileState.tileId, videoElement);
            console.log(`Successfully bound remote video tile ${tileState.tileId}`);
          } catch (error) {
            console.error(`Error binding remote video tile: ${error.message}`);
          }
        }
      },
      
      videoTileWasRemoved: tileId => {
        console.log(`Video tile removed: ${tileId}`);
        const videoContainer = document.getElementById(`video-container-${tileId}`);
        if (videoContainer) {
          videoContainer.remove();
        }
      }
    });
  };

  // Enhanced audio buffer flushing
  const flushAudioBuffer = () => {
    if (audioDataBufferRef.current.length === 0) {
      return;
    }
    
    if (!websocket || websocket.readyState !== WebSocket.OPEN) {
      console.warn("Cannot flush: WebSocket not connected");
      audioDataBufferRef.current = [];
      return;
    }
    
    try {
      const totalLength = audioDataBufferRef.current.reduce((acc, curr) => acc + curr.length, 0);
      const combined = new Int16Array(totalLength);
      
      let offset = 0;
      for (const buffer of audioDataBufferRef.current) {
        combined.set(buffer, offset);
        offset += buffer.length;
      }
      
      audioDataBufferRef.current = [];
      websocket.send(combined.buffer);
      console.log(`📤 Sent audio buffer: ${combined.buffer.byteLength} bytes`);
      
    } catch (sendError) {
      console.error("❌ Buffer send error:", sendError);
      audioDataBufferRef.current = [];
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      if (!mediaState.mediaReady) {
        setError("Media not ready. Please go back and set up your audio.");
        setOpenSnackbar(true);
        return;
      }

      if (!websocket || websocket.readyState !== WebSocket.OPEN) {
        setError("WebSocket not connected. Please refresh and try again.");
        setOpenSnackbar(true);
        return;
      }

      console.log("✅ Starting interview with pre-tested media...");

      if (!mediaState.audioTestStream) {
        setError("Audio stream not available");
        setOpenSnackbar(true);
        return;
      }

      // Create new audio context for recording
      const recordingContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });
      setAudioContext(recordingContext);

      // Set up recording pipeline
      const source = recordingContext.createMediaStreamSource(mediaState.audioTestStream);
      const bufferSize = 4096;
      const processor = recordingContext.createScriptProcessor(bufferSize, 1, 1);
      source.connect(processor);
      processor.connect(recordingContext.destination);

      // Set recording state
      setInterviewState(prev => ({ ...prev, isRecording: true }));
      audioDataBufferRef.current = [];

      // IMMEDIATE DEEPGRAM KEEPALIVE
      console.log("🚀 Sending immediate keepalive to Deepgram...");
      try {
        const keepaliveBuffer = new Int16Array(1024).fill(0);
        websocket.send(keepaliveBuffer.buffer);
        console.log("✅ Keepalive sent successfully");
      } catch (keepaliveError) {
        console.error("❌ Keepalive failed:", keepaliveError);
      }

      // Set up audio processing
      let chunkCount = 0;
      processor.onaudioprocess = (e) => {
        if (!isRecordingRef.current || !websocket || websocket.readyState !== WebSocket.OPEN) {
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.min(1, Math.max(-1, inputData[i])) * 32767;
        }

        chunkCount++;
        
        if (chunkCount <= 5) {
          // Send immediately for first 5 chunks
          console.log(`📤 Sending immediate chunk ${chunkCount}/5 to Deepgram`);
          try {
            websocket.send(pcmData.buffer);
          } catch (sendError) {
            console.error("Send error:", sendError);
          }
        } else {
          audioDataBufferRef.current.push(pcmData);
          if (audioDataBufferRef.current.length >= 2) {
            flushAudioBuffer();
          }
        }
      };

      // Set up Chime SDK with pre-tested streams
      try {
        console.log("Setting up Chime SDK with tested media...");
        
        if (chimeState.audioVideo) {
          // Use tested audio stream for Chime
          await chimeState.audioVideo.startAudioInput(mediaState.audioTestStream);
          console.log("✅ Chime SDK audio started with tested stream");
          
          // Use tested video stream for Chime (if available)
          if (mediaState.videoTestStream && mediaState.videoReady) {
            await chimeState.audioVideo.startVideoInput(mediaState.videoTestStream);
            chimeState.audioVideo.startLocalVideoTile();
            console.log("✅ Chime SDK video started with tested stream");
            setChimeState(prev => ({ ...prev, videoEnabled: true }));
          }
        }
      } catch (chimeError) {
        console.warn("⚠️ Chime SDK setup warning:", chimeError);
        // Continue - WebSocket audio is the priority
      }

      updateButtonStates();
      console.log("🎉 Recording started successfully with pre-tested media!");

    } catch (error) {
      console.error('❌ Recording startup error:', error);
      setError('Cannot start interview: ' + error.message);
      setOpenSnackbar(true);
      setInterviewState(prev => ({ ...prev, isRecording: false }));
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (!interviewState.isRecording) return;
    
    console.log("Stopping recording");
    setInterviewState(prev => ({ 
      ...prev, 
      isRecording: false, 
      isWaitingForAI: true 
    }));
    
    // Flush any remaining audio
    flushAudioBuffer();
    
    // Close audio context
    if (audioContext) {
      if (audioContext.state !== 'closed') {
        audioContext.close().catch(err => console.error('Error closing audio context:', err));
      }
      setAudioContext(null);
    }
    
    // Stop Chime SDK video/audio
    if (chimeState.videoEnabled && chimeState.audioVideo) {
      try {
        console.log("Stopping Chime SDK video...");
        chimeState.audioVideo.stopLocalVideoTile();
        chimeState.audioVideo.stopVideoInput();
      } catch (error) {
        console.error("Error stopping video:", error);
      }
    }
    
    try {
      if (chimeState.audioVideo) {
        chimeState.audioVideo.stopAudioInput();
        console.log("Chime SDK audio input stopped");
      }
    } catch (error) {
      console.error("Error stopping Chime SDK audio:", error);
    }
    
    setChimeState(prev => ({ ...prev, videoEnabled: false }));
    updateButtonStates();
  };

  // Toggle recording state
  const toggleRecording = async () => {
    if (interviewState.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Handle end dialog
  const handleEndDialogOpen = () => setOpenEndDialog(true);
  const handleEndDialogClose = () => setOpenEndDialog(false);

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" mb={3}>
        Step 2: AI Interview Session
      </Typography>
      
      {/* Connection Status Banner */}
      {!isConnected && (
        <Box mb={3} p={2} bgcolor="#fff3e0" borderRadius="8px" textAlign="center">
          <Typography variant="body1" color="warning.main" fontWeight="bold">
            {isLoading ? "🔄 Connecting to interview server..." : "⚠️ Not connected to server"}
          </Typography>
          {!isLoading && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              Please check your internet connection and try refreshing the page.
            </Typography>
          )}
        </Box>
      )}
      
      <Grid container spacing={3}>
        {/* Left Column - Video and Controls */}
        <Grid item xs={12} md={8}>
          {/* Video Section */}
          <Box mb={3}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Video
            </Typography>
            
            <Box 
              width="100%" 
              height="400px" 
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
                  <VideocamOffIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" mb={1}>
                    Audio-Only Mode
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your interview is running with audio only
                  </Typography>
                </Box>
              )}
              
              {/* Recording indicator overlay */}
              {interviewState.isRecording && (
                <Box
                  position="absolute"
                  top={16}
                  left={16}
                  display="flex"
                  alignItems="center"
                  bgcolor="rgba(244, 67, 54, 0.9)"
                  color="white"
                  px={2}
                  py={1}
                  borderRadius="20px"
                >
                  <RecordVoiceOverIcon sx={{ fontSize: 20, mr: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    Recording
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Status and Controls */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Interview Controls
            </Typography>
            
            <Box mb={2}>
              <Typography variant="body2" mb={1}>
                Status: 
                <span 
                  ref={connectionStatusRef}
                  style={{ 
                    fontWeight: 'bold', 
                    marginLeft: '8px',
                    color: interviewState.isRecording ? '#f44336' : 
                           interviewState.isWaitingForAI ? '#ff9800' : 
                           isLoading ? '#ff9800' :
                           isConnected && mediaState.mediaReady ? '#4caf50' : '#f44336' 
                  }}
                >
                  {interviewState.isRecording ? 'Recording...' : 
                   interviewState.isWaitingForAI ? 'Waiting for AI response...' : 
                   isLoading ? 'Connecting...' :
                   isConnected && mediaState.mediaReady ? 'Ready to start' : 'Not Ready'}
                </span>
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  ref={startRecordingBtnRef}
                  variant="contained"
                  color={interviewState.isRecording ? "error" : "success"}
                  onClick={toggleRecording}
                  disabled={!isConnected || !mediaState.mediaReady || interviewState.isWaitingForAI || interviewEnded || isLoading}
                  fullWidth
                  size="large"
                  startIcon={<MicIcon />}
                >
                  {interviewState.isRecording ? "Stop Speaking" : "Start Speaking"}
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleEndDialogOpen}
                  fullWidth
                  size="large"
                  startIcon={<ExitToAppIcon />}
                >
                  End Interview
                </Button>
              </Grid>
            </Grid>

            <Box mt={2}>
              <Button
                variant="text"
                color="primary"
                onClick={onPreviousStep}
                startIcon={<ArrowBackIcon />}
                disabled={interviewState.isRecording || isLoading}
              >
                Back to Media Setup
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Right Column - Transcripts and Info */}
        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Conversation
            </Typography>
            
            <Paper 
              elevation={1} 
              sx={{ 
                height: '400px', 
                overflow: 'auto', 
                p: 2,
                backgroundColor: '#fafafa'
              }}
              id="transcript-container"
            >
              {interviewState.transcripts.length === 0 ? (
                <Box 
                  display="flex" 
                  flexDirection="column"
                  justifyContent="center" 
                  alignItems="center" 
                  height="100%"
                  textAlign="center"
                >
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Start speaking to begin your conversation with the AI interviewer
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Your conversation will appear here
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {interviewState.transcripts.map((transcript, index) => (
                    <Box key={index} mb={2}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Chip 
                          label={transcript.speaker === 'human' ? 'You' : 'AI Interviewer'} 
                          size="small"
                          color={transcript.speaker === 'human' ? 'primary' : 'secondary'}
                          sx={{ fontSize: '0.7rem' }}
                        />
                        <Typography variant="caption" color="text.secondary" ml={1}>
                          {new Date(transcript.timestamp || Date.now()).toLocaleTimeString()}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          bgcolor: transcript.speaker === 'human' ? '#e3f2fd' : '#f3e5f5',
                          p: 1.5,
                          borderRadius: '8px',
                          borderLeft: `4px solid ${transcript.speaker === 'human' ? '#1976d2' : '#7b1fa2'}`
                        }}
                      >
                        {transcript.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>

            {/* Instructions */}
            <Box mt={2} p={2} bgcolor="#fff3e0" borderRadius="8px">
              <Typography variant="subtitle2" mb={1} color="warning.main">
                How to Use:
              </Typography>
              <Typography variant="body2" component="div">
                <ol style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Click "Start Speaking" and begin talking</li>
                  <li>The AI will automatically respond when you pause</li>
                  <li>Click "Stop Speaking" to end your turn</li>
                  <li>Wait for the AI response before speaking again</li>
                </ol>
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Remote videos container (hidden but available for Chime SDK) */}
      <div ref={remoteVideosRef} style={{ display: 'none' }} />

      {/* End Interview Confirmation Dialog */}
      <Dialog
        open={openEndDialog}
        onClose={handleEndDialogClose}
        aria-labelledby="end-interview-dialog-title"
      >
        <DialogTitle id="end-interview-dialog-title">
          End Interview
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to end this interview? This action cannot be undone, and the entire session will be terminated.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEndDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={endMeeting} color="error" variant="contained">
            End Interview
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default InterviewStep;