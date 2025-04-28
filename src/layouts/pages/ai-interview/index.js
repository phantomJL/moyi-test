import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import Icon from "@mui/material/Icon";

// Material Dashboard components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Amazon Chime SDK
import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration
} from 'amazon-chime-sdk-js';

// Context
import { useMaterialUIController } from "context";
import API from "services/api";
import { MeetingService } from "services";

// Polyfill for global object (needed for Chime SDK)
if (typeof global === 'undefined') {
  window.global = window;
}

function AIInterview() {
  const { interviewId, meetingCreateToken } = useParams();
  const navigate = useNavigate();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  
  // Interview state
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // Video/meeting state
  const localVideoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [meetingSession, setMeetingSession] = useState(null);
  const [audioVideo, setAudioVideo] = useState(null);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [volume, setVolume] = useState(50);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [remoteAttendees, setRemoteAttendees] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  
  // WebSocket Audio state
  const [audioContext, setAudioContext] = useState(null);
  const [audioSocket, setAudioSocket] = useState(null);
  const [audioInputProcessor, setAudioInputProcessor] = useState(null);
  const [audioOutputNode, setAudioOutputNode] = useState(null);
  const [isAudioStreaming, setIsAudioStreaming] = useState(false);
  
  // Mock data for interview questions
  const mockQuestions = [
    {
      id: "q1",
      text: "Tell me about your experience with React and how you've used it in past projects."
    },
    {
      id: "q2",
      text: "Describe a challenging project you worked on and how you overcame the obstacles."
    },
    {
      id: "q3",
      text: "How do you handle state management in large React applications?"
    },
    {
      id: "q4",
      text: "What's your approach to debugging complex issues in a web application?"
    }
  ];

  // Initialize interview
  useEffect(() => {
    console.log("here is tat asdfa")
    const initInterview = async () => {
      try {

        // const response = await axios.get(`/api/v1/interviews/${interviewId}`);
        // const data = response.data;
        
        // Using mock data for now
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setQuestions(mockQuestions);
        setCurrentQuestion(mockQuestions[0]);
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing interview:", error);
        setError("Failed to load interview questions");
        setIsLoading(false);
        setOpenSnackbar(true);
      }
    };
    
    initInterview();
  }, [interviewId]);

  // Create meeting function
  const createMeeting = async () => {
    setIsLoading(true);
    setError("");
    console.log("here is a test")
    try {
      // Call meeting creation API
      const response = await MeetingService.createMeeting({
        screeningId: interviewId || '72f0655c-6e42-4573-98b4-34f4b89483fa',
        meetingCreateToken: meetingCreateToken || '8fbcedf2-a1ce-4a4a-af23-06cb3b0ae6ad'
      });
      console.log(response)
      
      const meetingData = response.data.data;
      setCurrentMeeting(meetingData);
      
      // Initialize Chime SDK and start media
      const session = await initializeChimeSDK(meetingData);
      setMeetingSession(session);
      
      const av = session.audioVideo;
      setAudioVideo(av);
      
      // Set up video tile observers
      setupVideoTileObservers(av);
      
      // Start audio and video
      await startMedia(av);
      
      // Setup WebSocket audio
      await setupAudioWebSocket();
      
      setIsJoined(true);
      setSuccess("Meeting created successfully!");
      setOpenSnackbar(true);
      
      return true;
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                       (typeof error.response.data === 'object' ? 
                        JSON.stringify(error.response.data) : 
                        error.response.data) || 
                       "Failed to create meeting";
        setError(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        setError("No response from server. Please try again later.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Error creating meeting: ${error.message}`);
      }
      
      setOpenSnackbar(true);
      cleanupMedia();
      cleanupAudioWebSocket();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Chime SDK
  const initializeChimeSDK = async (meetingData) => {
    try {
      // Create a logger
      const logger = new ConsoleLogger('ChimeLogger', LogLevel.INFO);

      // Create a device controller
      const deviceController = new DefaultDeviceController(logger);

      // Create a meeting session configuration
      const configuration = new MeetingSessionConfiguration(
        {
          MeetingId: meetingData.meetingId,
          ExternalMeetingId: meetingData.externalMeetingId,
          MediaPlacement: {
            AudioHostUrl: meetingData.audioHostUrl,
            ScreenDataUrl: meetingData.screenDataUrl,
            ScreenSharingUrl: meetingData.screenSharingUrl,
            ScreenViewingUrl: meetingData.screenViewingUrl,
            SignalingUrl: meetingData.signalingUrl,
            TurnControlUrl: meetingData.turnControlUrl
          }
        },
        {
          AttendeeId: meetingData.attendeeId,
          ExternalUserId: meetingData.externalAttendeeUserId,
          JoinToken: meetingData.attendeeJoinToken
        }
      );

      // Create a meeting session
      return new DefaultMeetingSession(configuration, logger, deviceController);

    } catch (error) {
      console.error('Error initializing Chime SDK:', error);
      throw error;
    }
  };

  // Set up video tile observers
  const setupVideoTileObservers = (av) => {
    console.log('[Tile Debug] Setting up video tile observers...');

    av.addObserver({
      videoTileDidUpdate: tileState => {
        console.log('[Tile Debug] Video tile updated:', {
          tileId: tileState.tileId,
          boundAttendeeId: tileState.boundAttendeeId,
          isLocal: tileState.localTile,
          size: tileState.tileSize
        });

        if (!tileState.boundAttendeeId) {
          console.log('[Tile Debug] Skipping tile without attendee ID');
          return;
        }

        if (tileState.localTile) {
          console.log('[Tile Debug] Local tile updated');
          return;
        }

        // For remote attendees - add to state so we can render them
        setRemoteAttendees(prev => {
          // Check if this attendee is already in our list
          const exists = prev.some(a => a.attendeeId === tileState.boundAttendeeId);
          if (!exists) {
            return [...prev, {
              attendeeId: tileState.boundAttendeeId,
              tileId: tileState.tileId
            }];
          }
          return prev;
        });

        // Find the video element for this attendee and bind it
        setTimeout(() => {
          const videoElement = document.getElementById(`video-${tileState.tileId}`);
          if (videoElement) {
            console.log(`[Tile Debug] Binding video tile ${tileState.tileId} to element`);
            av.bindVideoElement(tileState.tileId, videoElement);
          }
        }, 500);
      },

      videoTileWasRemoved: tileId => {
        console.log(`[Tile Debug] Video tile removed: ${tileId}`);
        setRemoteAttendees(prev => prev.filter(a => a.tileId !== tileId));
      }
    });
  };

  // Start audio and video
  const startMedia = async (av) => {
    try {
      console.log('[Media Debug] Starting media initialization...');

      // Audio
      console.log('[Media Debug] Starting audio input...');
      const audioStream = await getAudioDevice();
      console.log('[Media Debug] Audio stream obtained');
      await av.startAudioInput(audioStream);
      console.log('[Media Debug] Audio input started successfully');

      // Video
      console.log('[Media Debug] Starting video input...');
      const videoStream = await getVideoDevice();
      console.log('[Media Debug] Video stream obtained');
      
      // Set the stream to state so we can display it
      setStream(videoStream);
      
      // Use this stream for the local video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = videoStream;
      }
      
      await av.startVideoInput(videoStream);
      console.log('[Media Debug] Video input started successfully');

      // Start the meeting session
      console.log('[Media Debug] Starting audioVideo session...');
      av.start();
      console.log('[Media Debug] Session started');

      // Start local video
      av.startLocalVideoTile();
      setCameraEnabled(true);

    } catch (error) {
      console.error('[Media Debug] Error in startMedia:', error);
      throw error;
    }
  };

  // Get video device
  const getVideoDevice = async () => {
    try {
      console.log('[Video Debug] Enumerating devices...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log('[Video Debug] Available devices:', devices);

      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log('[Video Debug] Video devices found:', videoDevices);

      if (videoDevices.length === 0) {
        console.error('[Video Debug] No video devices found!');
        throw new Error('No video devices found');
      }

      console.log('[Video Debug] Requesting video stream from device');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: videoDevices[0].deviceId,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      console.log('[Video Debug] Video stream obtained');
      return stream;
    } catch (error) {
      console.error('[Video Debug] Error getting video device:', error);
      throw error;
    }
  };

  // Get audio device
  const getAudioDevice = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices = devices.filter(device => device.kind === 'audioinput');

    if (audioDevices.length === 0) {
      throw new Error('No audio devices found');
    }

    return await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: audioDevices[0].deviceId,
        echoCancellation: true,
        noiseSuppression: true
      },
      video: false
    });
  };

  // Clean up media resources
  const cleanupMedia = () => {
    if (audioVideo) {
      try {
        audioVideo.stop();
        audioVideo.stopAudioInput();
        audioVideo.stopVideoInput();
      } catch (error) {
        console.error('Error stopping media:', error);
      }
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    setAudioVideo(null);
    setMeetingSession(null);
    setCurrentMeeting(null);
    setRemoteAttendees([]);
    setIsJoined(false);
    setCameraEnabled(false);
  };

  // WebSocket Audio setup
  const setupAudioWebSocket = async () => {
    try {
      // Create audio context
      const context = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(context);

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = context.createMediaStreamSource(stream);

      // Create WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//localhost:8080/api/v1/audio`;
      const socket = new WebSocket(wsUrl);
      socket.binaryType = 'arraybuffer';
      setAudioSocket(socket);

      // Set up audio processing
      const processor = context.createScriptProcessor(4096, 1, 1);
      setAudioInputProcessor(processor);
      source.connect(processor);
      processor.connect(context.destination);

      // Set up output node for received audio
      const outputNode = context.createGain();
      setAudioOutputNode(outputNode);
      outputNode.connect(context.destination);

      // WebSocket event handlers
      socket.onopen = () => {
        console.log('Audio WebSocket connected');
        setIsAudioStreaming(true);
      };

      socket.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          playReceivedAudio(event.data, context, outputNode);
        }
        else {
          console.error('Received non-binary message:', typeof event.data);
        }
      };

      socket.onclose = () => {
        console.log('Audio WebSocket disconnected');
        setIsAudioStreaming(false);
      };

      socket.onerror = (error) => {
        console.error('Audio WebSocket error:', error);
      };

      // Process audio input
      processor.onaudioprocess = (e) => {
        if (!isAudioStreaming || socket.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);

        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }

        socket.send(pcmData.buffer);
      };

    } catch (error) {
      console.error('Error setting up audio WebSocket:', error);
    }
  };

  // Play received audio
  const playReceivedAudio = (audioData, context, outputNode) => {
    if (!context || !outputNode) return;

    // Convert Int16Array to Float32Array
    const float32Data = new Float32Array(audioData.byteLength / 2);
    const int16Data = new Int16Array(audioData);

    for (let i = 0; i < int16Data.length; i++) {
      float32Data[i] = int16Data[i] / 32768.0;
    }

    // Create audio buffer and play
    const buffer = context.createBuffer(1, float32Data.length, context.sampleRate);
    buffer.getChannelData(0).set(float32Data);

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(outputNode);
    source.start();
  };

  // Cleanup audio WebSocket
  const cleanupAudioWebSocket = () => {
    if (audioInputProcessor) {
      audioInputProcessor.disconnect();
      setAudioInputProcessor(null);
    }

    if (audioOutputNode) {
      audioOutputNode.disconnect();
      setAudioOutputNode(null);
    }

    if (audioSocket) {
      audioSocket.close();
      setAudioSocket(null);
    }

    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
      setAudioContext(null);
    }

    setIsAudioStreaming(false);
  };

  // Delete meeting
  const deleteMeeting = async () => {
    if (!currentMeeting || !currentMeeting.meetingId) {
      setError('No active meeting to delete');
      setOpenSnackbar(true);
      return false;
    }

    setIsLoading(true);
    setError("");

    try {
      // Clean up resources
      cleanupMedia();
      cleanupAudioWebSocket();

      // Call delete meeting API
      await MeetingService.deleteMeeting(currentMeeting.meetingId);
      
      setSuccess("Meeting ended successfully!");
      setOpenSnackbar(true);
      return true;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(error.response.data || "Failed to delete meeting");
      } else if (error.request) {
        // The request was made but no response was received
        setError("No response from server. Please try again later.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Error deleting meeting: ${error.message}`);
      }
      
      setOpenSnackbar(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Enable camera without joining meeting
  const enableCamera = async () => {
    try {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      
      setStream(userMedia);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = userMedia;
      }
      
      setCameraEnabled(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setError("Failed to access camera and microphone. Please check your permissions.");
      setOpenSnackbar(true);
    }
  };

  // Handle test video
  const handleTestVideo = async () => {
    if (!isJoined) {
      if (!cameraEnabled) {
        await enableCamera();
      } else {
        setCameraEnabled(false);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
        }
      }
    } else {
      setError("Cannot toggle camera while in a meeting");
      setOpenSnackbar(true);
    }
  };

  // Handle volume change
  const handleVolumeChange = (event) => {
    const newVolume = parseInt(event.target.value);
    setVolume(newVolume);
    // Update video volume if available
    if (localVideoRef.current) {
      localVideoRef.current.volume = newVolume / 100;
    }
  };

  // Handle meeting start
  const handleStartMeeting = async () => {
    if (!isJoined) {
      const success = await createMeeting();
      if (success) {
        setSuccess("Meeting created and joined successfully!");
        setOpenSnackbar(true);
      }
    } else {
      setError("Already in a meeting");
      setOpenSnackbar(true);
    }
  };

  // Toggle recording state
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  // Handle meeting end
  const handleEndMeeting = async () => {
    if (isJoined) {
      const success = await deleteMeeting();
      if (success) {
        setSuccess("Meeting ended successfully!");
        setOpenSnackbar(true);
      }
    } else {
      setError("Not in a meeting");
      setOpenSnackbar(true);
    }
  };

  // Handle submit answer
  const handleSubmitAnswer = async () => {
    // In a real app, you would submit the answer together with any meeting recordings
    try {
      setIsLoading(true);
      
      // Mock successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess("Response submitted successfully!");
      setOpenSnackbar(true);
      
      // If it's the last question, end the meeting automatically
      if (currentQuestionIndex === questions.length - 1) {
        await handleEndMeeting();
        // Move to complete state
        setInterviewComplete(true);
      } else {
        // Move to next question
        moveToNextQuestion();
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error submitting answer:", error);
      setError("Failed to submit your response. Please try again.");
      setOpenSnackbar(true);
      setIsLoading(false);
    }
  };

  // Move to next question
  const moveToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
      setIsRecording(false);
    } else {
      // Interview complete
      setInterviewComplete(true);
    }
  };

  // Quit interview
  const handleQuitInterview = async () => {
    if (window.confirm("Are you sure you want to quit the interview? Your progress will be lost.")) {
      // End meeting if active
      if (isJoined) {
        await deleteMeeting();
      }
      
      // Clean up resources
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      navigate('/'); // Navigate to home
    }
  };

  // Handle Snackbar close
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError("");
    setSuccess("");
  };

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      cleanupMedia();
      cleanupAudioWebSocket();
    };
  }, []);

  // Effect to handle stream changes
  useEffect(() => {
    if (stream && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Render interview complete view
  if (interviewComplete) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Card>
          <MDBox 
            p={3} 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            textAlign="center"
          >
            <MDBox mb={2}>
              <MDTypography variant="h4" fontWeight="medium">
                Interview Complete!
              </MDTypography>
            </MDBox>
            
            <MDBox mb={4}>
              <MDTypography variant="body1" color="text">
                Thank you for completing the interview. Your responses have been recorded and will be reviewed.
              </MDTypography>
            </MDBox>
            
            <MDButton 
              variant="gradient" 
              color="info"
              onClick={() => navigate('/')}
            >
              Return to Home
            </MDButton>
          </MDBox>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <MDBox 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
      >
        <MDButton 
          variant="text" 
          color="info"
          onClick={handleQuitInterview}
        >
          Quit Screening
        </MDButton>
        
        {!isJoined && (
          <MDButton 
            variant="contained" 
            color="success"
            onClick={handleStartMeeting}
          >
            Start Meeting
          </MDButton>
        )}
        
        {isJoined && (
          <MDButton 
            variant="contained" 
            color="error"
            onClick={handleEndMeeting}
          >
            End Meeting
          </MDButton>
        )}
      </MDBox>
      
      {isLoading ? (
        <Card>
          <MDBox 
            p={3} 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height="400px"
          >
            <CircularProgress />
          </MDBox>
        </Card>
      ) : (
        <Card>
          <MDBox p={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {/* Video Display */}
                <MDBox 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center"
                >
                  <MDBox 
                    width="100%" 
                    height="300px" 
                    border="1px solid #ddd" 
                    borderRadius="lg"
                    overflow="hidden"
                    position="relative"
                    mb={2}
                  >
                    {cameraEnabled ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <MDBox 
                        display="flex" 
                        justifyContent="center" 
                        alignItems="center"
                        height="100%"
                        bgcolor={darkMode ? "#1a2035" : "#f0f0f0"}
                      >
                        <MDTypography variant="h5" color="text">
                          Camera Off
                        </MDTypography>
                      </MDBox>
                    )}
                  </MDBox>
                  
                  {/* Remote Attendees */}
                  {remoteAttendees.length > 0 && (
                    <MDBox 
                      width="100%" 
                      mb={2}
                    >
                      <MDTypography variant="subtitle1" mb={1}>
                        Remote Participants:
                      </MDTypography>
                      <MDBox 
                        display="grid" 
                        gridTemplateColumns="repeat(auto-fill, minmax(150px, 1fr))" 
                        gap={1}
                      >
                        {remoteAttendees.map(attendee => (
                          <MDBox 
                            key={attendee.tileId} 
                            border="1px solid #ddd" 
                            borderRadius="md" 
                            overflow="hidden"
                            position="relative"
                            height="120px"
                          >
                            <MDTypography 
                              variant="caption" 
                              position="absolute"
                              top={0}
                              left={0}
                              bgcolor="rgba(0,0,0,0.5)"
                              color="white"
                              p={0.5}
                            >
                              {attendee.attendeeId.split('#')[0]}
                            </MDTypography>
                            <video
                              id={`video-${attendee.tileId}`}
                              autoPlay
                              playsInline
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </MDBox>
                        ))}
                      </MDBox>
                    </MDBox>
                  )}
                  
                  {/* Audio & Video Controls */}
                  <MDBox 
                    display="flex" 
                    alignItems="center" 
                    width="100%" 
                    mb={2}
                  >
                    <MDBox width="100%" display="flex" alignItems="center" justifyContent="space-between">
                      <MDBox display="flex" gap={2}>
                        {/* Camera control */}
                        <Tooltip title={!isJoined ? (cameraEnabled ? "Stop Video" : "Test Video") : "Camera Active"}>
                          <MDButton
                            variant="outlined"
                            color={cameraEnabled ? "success" : "info"}
                            circular
                            iconOnly
                            onClick={handleTestVideo}
                            disabled={isJoined}
                          >
                            <Icon>
                              {cameraEnabled ? "videocam" : "videocam_off"}
                            </Icon>
                          </MDButton>
                        </Tooltip>
                        
                        {/* Recording control */}
                        {isJoined && (
                          <Tooltip title={isRecording ? "Stop Recording" : "Start Recording"}>
                            <MDButton
                              variant="outlined"
                              color={isRecording ? "error" : "success"}
                              circular
                              iconOnly
                              onClick={toggleRecording}
                            >
                              <Icon>
                                {isRecording ? "stop_circle" : "mic"}
                              </Icon>
                            </MDButton>
                          </Tooltip>
                        )}
                      </MDBox>
                      
                      {/* Volume control */}
                      <MDBox display="flex" alignItems="center" width="50%">
                        <Icon fontSize="small">volume_down</Icon>
                        <MDBox mx={1} flex="1">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={handleVolumeChange}
                            style={{ width: '100%' }}
                          />
                        </MDBox>
                        <Icon fontSize="small">volume_up</Icon>
                      </MDBox>
                    </MDBox>
                  </MDBox>
                </MDBox>
              </Grid>
              
              <Grid item xs={12} md={6}>
                {/* Question and Controls */}
                <MDBox>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </MDTypography>
                  
                  <MDBox 
                    p={3} 
                    borderRadius="lg" 
                    mb={3} 
                    bgcolor={darkMode ? "#1a2035" : "#f8f9fa"}
                  >
                    <MDTypography variant="body1">
                      {currentQuestion?.text || "Loading question..."}
                    </MDTypography>
                  </MDBox>
                  
                  {/* Meeting Controls */}
                  <MDBox display="flex" justifyContent="space-between" alignItems="center">
                    {!isJoined ? (
                      <MDButton 
                        variant="contained" 
                        color="success"
                        onClick={handleStartMeeting}
                      >
                        Start Interview
                      </MDButton>
                    ) : (
                      <>
                        {isRecording ? (
                          <MDBox display="flex" alignItems="center">
                            <MDBox
                              width="12px"
                              height="12px"
                              borderRadius="50%"
                              bgcolor="error.main"
                              mr={1}
                              sx={{ animation: "pulse 1.5s infinite" }}
                            />
                            <MDTypography variant="button" color="text">
                              Recording...
                            </MDTypography>
                          </MDBox>
                        ) : (
                          <MDTypography variant="button" color="text">
                            Ready to record
                          </MDTypography>
                        )}
                        
                        <MDButton 
                          variant="contained" 
                          color="info"
                          onClick={handleSubmitAnswer}
                          disabled={!isRecording && !isJoined}
                        >
                          Submit Answer
                        </MDButton>
                      </>
                    )}
                  </MDBox>
                  
                  {/* Interview Status */}
                  {isJoined && (
                    <MDBox 
                      mt={3} 
                      p={2} 
                      borderRadius="lg" 
                      bgcolor={darkMode ? "rgba(26, 32, 53, 0.7)" : "rgba(248, 249, 250, 0.7)"}
                    >
                      <MDBox display="flex" justifyContent="space-between" alignItems="center">
                        <MDTypography variant="body2">
                          Interview Progress:
                        </MDTypography>
                        <MDTypography variant="body2" fontWeight="medium">
                          {currentQuestionIndex + 1} of {questions.length}
                        </MDTypography>
                      </MDBox>
                      
                      <MDBox mt={1} width="100%" height="6px" bgcolor={darkMode ? "#2d3559" : "#e9ecef"} borderRadius="lg">
                        <MDBox 
                          height="100%" 
                          width={`${((currentQuestionIndex + 1) / questions.length) * 100}%`}
                          bgcolor="info.main"
                          borderRadius="lg"
                        />
                      </MDBox>
                    </MDBox>
                  )}
                </MDBox>
              </Grid>
            </Grid>
            
            {/* Meeting Status */}
            {isJoined && (
              <MDBox 
                mt={3} 
                p={2} 
                borderRadius="lg" 
                bgcolor={darkMode ? "rgba(26, 32, 53, 0.7)" : "rgba(248, 249, 250, 0.7)"}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <MDTypography variant="body2" fontWeight="medium">
                      Meeting ID: {currentMeeting?.meetingId?.substring(0, 8) || "Unknown"}...
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MDTypography variant="body2">
                      Status: <span style={{ color: '#4caf50', fontWeight: 'bold' }}>Active</span>
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MDTypography variant="body2">
                      Participants: {remoteAttendees.length + 1}
                    </MDTypography>
                  </Grid>
                </Grid>
              </MDBox>
            )}
          </MDBox>
        </Card>
      )}
      
      {/* Error/Success Snackbar */}
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
          {typeof error === 'object' ? JSON.stringify(error) : error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AIInterview;