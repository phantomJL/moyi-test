// AIInterview.js - Main component with stepper
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card, Container, CircularProgress, Alert, Snackbar, Box, Typography,
  Stepper, Step, StepLabel
} from '@mui/material';
import { MeetingService } from 'services';

// Import step components
import MediaSetupStep from './components/MediaSetupStep';
import InterviewStep from './components/InterviewStep';

// Import Amazon Chime SDK
import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration
} from 'amazon-chime-sdk-js';

function AIInterview() {
  const params = useParams();
  const interviewId = params.interviewId;
  const meetingCreateToken = params.meetingCreateToken;

  // Step state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Media Setup', 'Interview'];

  // Core interview state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [websocket, setWebsocket] = useState(null);
  const [interviewEnded, setInterviewEnded] = useState(false);

  // Media state - shared between steps
  const [mediaState, setMediaState] = useState({
    audioReady: false,
    videoReady: false,
    audioEnabled: false,
    cameraEnabled: false,
    audioTestStream: null,
    videoTestStream: null,
    mediaReady: false
  });

  // Interview state
  const [interviewState, setInterviewState] = useState({
    isRecording: false,
    isWaitingForAI: false,
    transcripts: []
  });

  // Chime SDK state
  const [chimeState, setChimeState] = useState({
    meetingSession: null,
    audioVideo: null,
    videoEnabled: false
  });

  // Refs
  const heartbeatIntervalRef = useRef(null);
  const audioDataBufferRef = useRef([]);
  const isRecordingRef = useRef(false);

  // Sync recording state to ref
  useEffect(() => {
    isRecordingRef.current = interviewState.isRecording;
  }, [interviewState.isRecording]);

  // Auto-initialize interview
  useEffect(() => {
    const initInterview = async () => {
      try {
        setIsLoading(true);
        if (interviewId && meetingCreateToken) {
          await createMeeting();
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing:", error);
        setError(`Initialization error: ${error.message || "Unknown error"}`);
        setIsLoading(false);
        setOpenSnackbar(true);
      }
    };

    if (interviewId) {
      initInterview();
    }

    return () => {
      console.log("Component unmounting - cleaning up all resources");
      cleanupAllResources();
    };
  }, [interviewId, meetingCreateToken]);

  // Create meeting and establish WebSocket connection
  const createMeeting = async () => {
    try {
      console.log("Creating meeting...");
      const response = await MeetingService.createMeeting(interviewId, meetingCreateToken);
      
      if (!response.data || !response.data.data) {
        throw new Error("Invalid response from server");
      }
      
      const meetingResponseData = response.data.data;
      console.log("Meeting created:", meetingResponseData);
      setCurrentMeeting(meetingResponseData);
      setIsJoined(true);
      
      try {
        console.log("Connecting to WebSocket:", meetingResponseData.aiAudioUrl);
        const wsConnection = await connectWebSocket(meetingResponseData.aiAudioUrl, meetingResponseData.aiSessionId);
        console.log("WebSocket connected:", wsConnection.readyState);
        setSuccess("Connected to interview AI! Please set up your media.");
        setOpenSnackbar(true);
        
        if (meetingResponseData.meetingId) {
          try {
            console.log("WebSocket connected, now initializing Chime SDK...");
            await initializeChimeSDK(meetingResponseData);
            console.log("Chime SDK initialized");
          } catch (sdkError) {
            console.warn("Chime SDK warning:", sdkError);
          }
        }
        
        return true;
      } catch (wsError) {
        console.error("WebSocket connection error:", wsError);
        setError("Connection error. Please try again.");
        setOpenSnackbar(true);
        setIsJoined(true);
      }
      
      return true;
    } catch (error) {
      console.error("Error:", error);
      setError(`Error: ${error.message || "Unknown error"}`);
      setOpenSnackbar(true);
      return false;
    }
  };

  // Initialize Amazon Chime SDK
  const initializeChimeSDK = async (meetingData) => {
    if (!meetingData) meetingData = currentMeeting;
    if (!meetingData) return;
    
    try {
      console.log("Initializing Chime SDK...");
      
      const logger = new ConsoleLogger('ChimeLogger', LogLevel.INFO);
      const deviceController = new DefaultDeviceController(logger);
      
      const configuration = new MeetingSessionConfiguration(
        {
          MeetingId: meetingData.meetingId,
          ExternalMeetingId: meetingData.externalMeetingId || meetingData.meetingId,
          MediaPlacement: {
            AudioHostUrl: meetingData.audioHostUrl,
            ScreenDataUrl: meetingData.screenDataUrl || '',
            ScreenSharingUrl: meetingData.screenSharingUrl || '',
            ScreenViewingUrl: meetingData.screenViewingUrl || '',
            SignalingUrl: meetingData.signalingUrl,
            TurnControlUrl: meetingData.turnControlUrl || ''
          }
        },
        {
          AttendeeId: meetingData.attendeeId,
          ExternalUserId: meetingData.externalAttendeeUserId || 'user-' + Date.now(),
          JoinToken: meetingData.attendeeJoinToken
        }
      );
      
      const session = new DefaultMeetingSession(configuration, logger, deviceController);
      const av = session.audioVideo;
      
      setChimeState({
        meetingSession: session,
        audioVideo: av,
        videoEnabled: false
      });
      
      av.start();
      console.log("Chime SDK session started");
      
      return session;
    } catch (error) {
      console.error("Error initializing Chime SDK:", error);
      throw error;
    }
  };

  // Connect to WebSocket
  const connectWebSocket = async (websocketUrl, sessionId) => {
    try {
      if (websocket) {
        try {
          websocket.close();
        } catch (e) {
          console.log('Closing existing websocket:', e);
        }
      }
      
      // Process WebSocket URL
      let finalWebsocketUrl = websocketUrl;
      if (websocketUrl.startsWith('https://')) {
        finalWebsocketUrl = 'wss://' + finalWebsocketUrl.substring('https://'.length);
      } else if (websocketUrl.startsWith('http://')) {
        finalWebsocketUrl = 'ws://' + finalWebsocketUrl.substring('http://'.length);
      }
      
      console.log('🔌 Connecting to WebSocket:', finalWebsocketUrl);
      
      return new Promise((resolve, reject) => {
        const ws = new WebSocket(finalWebsocketUrl);
        ws.binaryType = 'arraybuffer';
        
        const connectionTimeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            ws.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);
        
        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('✅ WebSocket connected successfully');
          setIsConnected(true);
          
          // Send configuration
          try {
            const config = {
              type: 'configuration',
              data: {
                encoding: 'linear16',
                sample_rate: 16000,
                channels: 1,
                interim_results: true,
                endpointing: 500,
                utterance_end_ms: 1500,
                vad_events: true,
                smart_format: true
              }
            };
            
            ws.send(JSON.stringify(config));
            console.log('✅ Configuration sent to Deepgram');
          } catch (configError) {
            console.warn('⚠️ Configuration send failed:', configError);
          }
          
          // Setup heartbeat
          heartbeatIntervalRef.current = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              try {
                ws.send(JSON.stringify({
                  type: 'heartbeat',
                  timestamp: new Date().toISOString()
                }));
              } catch (e) {
                console.error('Heartbeat error:', e);
              }
            }
          }, 5000);
          
          setWebsocket(ws);
          resolve(ws);
        };
        
        ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          setIsConnected(false);
          
          if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
          }
          
          console.error('❌ WebSocket closed:', event);
          
          if (event.code === 1011) {
            setError('Deepgram timeout: Please try again and speak immediately after starting.');
          } else if (event.code !== 1000 && isJoined && !interviewEnded) {
            setError(`Connection closed: ${event.reason || 'Unknown reason'}`);
          }
          
          setOpenSnackbar(true);
          reject(new Error(`Connection closed: ${event.reason || 'Unknown'}`));
        };
        
        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          if (!interviewEnded) {
            setError('WebSocket connection error. Please refresh and try again.');
            setOpenSnackbar(true);
          }
        };
        
        ws.onmessage = handleWebSocketMessage;
      });
    } catch (error) {
      console.error('❌ WebSocket setup error:', error);
      throw error;
    }
  };

  // Handle WebSocket messages
  const handleWebSocketMessage = (event) => {
    try {
      if (event.data instanceof ArrayBuffer) {
        // Handle binary audio data - will be implemented in InterviewStep
        return;
      }
      
      const message = JSON.parse(event.data);
      console.log("Received message:", message);
      
      switch (message.type) {
        case 'transcript':
          setInterviewState(prev => ({
            ...prev,
            transcripts: [...prev.transcripts, message],
            isWaitingForAI: message.speaker === 'ai' ? false : prev.isWaitingForAI
          }));
          break;
          
        case 'event':
          handleEventMessage(message);
          break;
          
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Message handling error:', error);
    }
  };

  // Handle event messages
  const handleEventMessage = (message) => {
    if (message.event === 'error') {
      setError(message.data?.message || "Unknown error occurred");
      setOpenSnackbar(true);
    } else if (message.event === 'session_end' || message.event === 'interview_complete') {
      setSuccess('Interview completed: ' + (message.data?.reason || 'successfully'));
      setOpenSnackbar(true);
      setInterviewEnded(true);
    } else if (message.event === 'processing_start') {
      setInterviewState(prev => ({ ...prev, isWaitingForAI: true }));
    }
  };

  // Move to next step
  const handleNextStep = () => {
    if (activeStep === 0 && mediaState.mediaReady) {
      setActiveStep(1);
      setSuccess("Media setup complete! You can now start the interview.");
      setOpenSnackbar(true);
    }
  };

  // Go back to previous step
  const handlePreviousStep = () => {
    if (activeStep === 1) {
      setActiveStep(0);
    }
  };

  // Clean up all resources
  const cleanupAllResources = () => {
    console.log("Cleaning up all resources");
    
    // Clean up WebSocket
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    if (websocket && websocket.readyState !== WebSocket.CLOSED) {
      websocket.close(1000, 'Normal closure');
      setWebsocket(null);
    }
    
    // Clean up media streams
    if (mediaState.audioTestStream) {
      mediaState.audioTestStream.getTracks().forEach(track => track.stop());
    }
    
    if (mediaState.videoTestStream) {
      mediaState.videoTestStream.getTracks().forEach(track => track.stop());
    }
    
    // Clean up Chime SDK
    if (chimeState.audioVideo) {
      try {
        chimeState.audioVideo.stop();
      } catch (error) {
        console.error("Error stopping Chime SDK:", error);
      }
    }
    
    setIsConnected(false);
  };

  // End meeting
  const endMeeting = async () => {
    if (!currentMeeting?.meetingId) {
      setError('No active meeting');
      setOpenSnackbar(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      cleanupAllResources();
      await MeetingService.deleteMeeting(interviewId, currentMeeting.meetingId);
      
      setSuccess("Interview ended. Thank you for your participation!");
      setOpenSnackbar(true);
      setInterviewEnded(true);
    } catch (error) {
      setError(`Error ending interview: ${error.message}`);
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError("");
    setSuccess("");
  };

  // Shared props for step components
  const sharedProps = {
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
    error,
    setError,
    success,
    setSuccess,
    openSnackbar,
    setOpenSnackbar,
    endMeeting
  };

  // Main render
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
      >
        <Typography variant="h5" fontWeight="bold">
          {interviewEnded ? 
            "Thank you for your participation!" : 
            "AI Interview Interface"}
        </Typography>
        
        {isJoined && !interviewEnded && (
          <Typography variant="body2">
            Session ID: <strong>{currentMeeting?.aiSessionId?.substring(0, 12) || "Unknown"}</strong>
          </Typography>
        )}
      </Box>
      
      {isLoading ? (
        <Card>
          <Box 
            p={3} 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height="400px"
          >
            <CircularProgress />
          </Box>
        </Card>
      ) : interviewEnded ? (
        <Card>
          <Box 
            p={4} 
            display="flex" 
            flexDirection="column"
            justifyContent="center" 
            alignItems="center" 
            height="400px"
            textAlign="center"
          >
            <Typography variant="h4" gutterBottom color="primary">
              Interview Completed
            </Typography>
            <Typography variant="body1" paragraph>
              Thank you for participating in this AI interview session.
            </Typography>
            <Typography variant="body1" paragraph>
              Your responses have been recorded successfully.
            </Typography>
            <Typography variant="body1">
              You may now close this window.
            </Typography>
          </Box>
        </Card>
      ) : (
        <Card>
          <Box
            variant="gradient"
            sx={{
              borderRadius: '0.75rem',
              margin: 2,
              marginBottom: 1,
              padding: 3,
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" fontWeight="medium" color="white" mt={1}>
              AI Interview
            </Typography>
            <Typography display="block" variant="button" color="white" my={1}>
              {activeStep === 0 
                ? "First, let's set up and test your audio and video" 
                : "Now you can start your interview with the AI"}
            </Typography>
          </Box>
          
          <Box p={3}>
            {/* Stepper */}
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {/* Step Content */}
            {activeStep === 0 ? (
              <MediaSetupStep 
                {...sharedProps}
                onNextStep={handleNextStep}
              />
            ) : (
              <InterviewStep 
                {...sharedProps}
                onPreviousStep={handlePreviousStep}
              />
            )}
          </Box>
        </Card>
      )}
      
      {/* Notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? "error" : "success"} 
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AIInterview;