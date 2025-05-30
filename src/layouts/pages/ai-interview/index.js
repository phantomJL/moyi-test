import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Grid, Card, Container, CircularProgress, Alert, Snackbar, Box, Typography, Button,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { MeetingService } from 'services';

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

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [websocket, setWebsocket] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [stream, setStream] = useState(null);
  const [volume] = useState(50);
  const [openEndDialog, setOpenEndDialog] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  
  // Silence detection state
  const [silenceThreshold] = useState(5); // Threshold for detecting silence (in percent)
  const [silenceTime, setSilenceTime] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Amazon Chime SDK state
  const [meetingSession, setMeetingSession] = useState(null);
  const [audioVideo, setAudioVideo] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(false);

  // Refs
  const isRecordingRef = useRef(false);
  const localVideoRef = useRef(null);
  const audioLevelIndicatorRef = useRef(null);
  const connectionStatusRef = useRef(null);
  const startRecordingBtnRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const audioDataBufferRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const audioAnalyserRef = useRef(null);
  const remoteVideosRef = useRef(null);

  // Sync recording state to ref
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

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
      cleanupMedia();
      cleanupWebSocket();
      cleanupChimeSDK();
    };
  }, [interviewId, meetingCreateToken]);

  // Update video element when stream changes
  useEffect(() => {
    if (stream && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Update button states
  useEffect(() => {
    if (startRecordingBtnRef.current) {
      updateButtonStates();
    }
  }, [isRecording, isConnected, isWaitingForAI, videoEnabled]);

  // Auto-scroll to the latest transcript
  useEffect(() => {
    if (transcripts.length > 0) {
      const transcriptContainer = document.getElementById('transcript-container');
      if (transcriptContainer) {
        transcriptContainer.scrollTop = transcriptContainer.scrollHeight;
      }
    }
  }, [transcripts]);

  // Check for silence and flush audio buffer on pauses
  const checkForSilence = (audioLevel) => {
    if (audioLevel < silenceThreshold) {
      // Increment silence time
      setSilenceTime(prev => prev + 1);
      
      // If silence persists for 1.5 seconds and was previously speaking, flush the buffer
      if (silenceTime > 15 && isSpeaking && audioDataBufferRef.current.length > 0) {
        setIsSpeaking(false);
        flushAudioBuffer();
      }
    } else {
      // Reset silence time and mark as speaking
      setSilenceTime(0);
      setIsSpeaking(true);
    }
  };

  // Flush audio buffer to server
  const flushAudioBuffer = () => {
    if (audioDataBufferRef.current.length === 0 || !websocket || websocket.readyState !== WebSocket.OPEN) {
      return;
    }
    
    // Combine buffer chunks
    const totalLength = audioDataBufferRef.current.reduce((acc, curr) => acc + curr.length, 0);
    const combined = new Int16Array(totalLength);
    
    let offset = 0;
    for (const buffer of audioDataBufferRef.current) {
      combined.set(buffer, offset);
      offset += buffer.length;
    }
    
    // Clear buffer
    audioDataBufferRef.current = [];
    
    // Send to server
    console.log(`Flushing audio buffer: ${combined.buffer.byteLength} bytes`);
    websocket.send(combined.buffer);
  };

  // Toggle recording state
  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Toggle video
  const toggleVideo = async () => {
    if (isRecording) {
      setError("Cannot toggle video while recording. Stop recording first.");
      setOpenSnackbar(true);
      return;
    }
    
    if (videoEnabled) {
      stopVideo();
    } else {
      startVideo();
    }
  };

  // Start video - connecting with Chime SDK
  const startVideo = async () => {
    try {
      console.log("Starting video for testing purposes only...");
      if (!meetingSession || !audioVideo) {
        console.log("No active meeting session. Attempting to initialize Chime SDK for video...");
        
        if (!currentMeeting || !currentMeeting.meetingId) {
          throw new Error("No meeting data available. Please ensure meeting is created first.");
        }
        
        await initializeChimeSDK();
      }
      
      // Get video device
      console.log("Getting video device...");
      const videoStream = await getVideoDevice();
      
      // First set the video in our own UI component
      if (localVideoRef.current && videoStream) {
        localVideoRef.current.srcObject = videoStream;
      }
      
      // Log video stream details for debugging
      if (videoStream && videoStream.getVideoTracks().length > 0) {
        const track = videoStream.getVideoTracks()[0];
        console.log("Video track enabled:", track.enabled);
        console.log("Video track settings:", track.getSettings());
        console.log("Video track constraints:", track.getConstraints());
      }
      
      // Then connect it to Chime SDK
      if (audioVideo) {
        try {
          console.log("Starting video input with Chime SDK...");
          await audioVideo.startVideoInput(videoStream);
          console.log("Starting local video tile...");
          audioVideo.startLocalVideoTile();
          console.log("Video started successfully");
        } catch (videoError) {
          console.error("Chime SDK video error:", videoError);
          throw videoError;
        }
      } else {
        throw new Error("Audio/Video controller not initialized");
      }
      
      setVideoEnabled(true);
      setCameraEnabled(true);
    } catch (error) {
      console.error("Error starting video:", error);
      setError(`Video error: ${error.message}`);
      setOpenSnackbar(true);
    }
  };

  // Initialize Amazon Chime SDK (audio and video)
  const initializeChimeSDK = async () => {
    if (!currentMeeting) return;
    
    try {
      console.log("Initializing Chime SDK for audio and video...");
      
      // Create a logger
      const logger = new ConsoleLogger('ChimeLogger', LogLevel.INFO);
      
      // Create a device controller
      const deviceController = new DefaultDeviceController(logger);
      
      // Create a meeting session configuration using URLs directly from the API response
      const configuration = new MeetingSessionConfiguration(
        {
          MeetingId: currentMeeting.meetingId,
          ExternalMeetingId: currentMeeting.externalMeetingId || currentMeeting.meetingId,
          MediaPlacement: {
            AudioHostUrl: currentMeeting.audioHostUrl,
            ScreenDataUrl: currentMeeting.screenDataUrl || '',
            ScreenSharingUrl: currentMeeting.screenSharingUrl || '',
            ScreenViewingUrl: currentMeeting.screenViewingUrl || '',
            SignalingUrl: currentMeeting.signalingUrl,
            TurnControlUrl: currentMeeting.turnControlUrl || ''
          }
        },
        {
          AttendeeId: currentMeeting.attendeeId,
          ExternalUserId: currentMeeting.externalAttendeeUserId || 'user-' + Date.now(),
          JoinToken: currentMeeting.attendeeJoinToken
        }
      );
      
      // Log the configuration to help with debugging
      console.log("Chime SDK configuration:", {
        meetingId: currentMeeting.meetingId,
        attendeeId: currentMeeting.attendeeId,
        audioHostUrl: currentMeeting.audioHostUrl,
        signalingUrl: currentMeeting.signalingUrl
      });
      
      // Create a meeting session
      const session = new DefaultMeetingSession(configuration, logger, deviceController);
      setMeetingSession(session);
      
      const av = session.audioVideo;
      setAudioVideo(av);
      
      // Set up video tile observers
      setupVideoTileObservers(av);
      
      // Start the session
      av.start();
      console.log("Chime SDK session started");
      
      return session;
    } catch (error) {
      console.error("Error initializing Chime SDK:", error);
      throw error;
    }
  };

  // Stop video
  const stopVideo = () => {
    try {
      if (audioVideo) {
        audioVideo.stopLocalVideoTile();
        audioVideo.stopVideoInput();
      }
      
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const tracks = localVideoRef.current.srcObject.getVideoTracks();
        tracks.forEach(track => track.stop());
        localVideoRef.current.srcObject = null;
      }
      
      setVideoEnabled(false);
      setCameraEnabled(false);
    } catch (error) {
      console.error("Error stopping video:", error);
    }
  };

  // Helper to update button states
  const updateButtonStates = () => {
    if (startRecordingBtnRef.current) {
      // Disable start button if: not connected, or waiting for AI, or interview ended
      const shouldDisable = !isConnected || isWaitingForAI || interviewEnded;
      startRecordingBtnRef.current.disabled = shouldDisable;
      
      // Update button text based on state
      if (isRecording) {
        startRecordingBtnRef.current.textContent = "Stop Interview";
        startRecordingBtnRef.current.style.backgroundColor = "#f44336"; // Red
      } else {
        startRecordingBtnRef.current.textContent = "Start Interview";
        startRecordingBtnRef.current.style.backgroundColor = "#4caf50"; // Green
      }
    }
    
    if (connectionStatusRef.current) {
      if (interviewEnded) {
        connectionStatusRef.current.classList.remove('recording');
        connectionStatusRef.current.textContent = 'Interview Ended';
        connectionStatusRef.current.style.color = '#757575'; // Gray
      } else if (isRecording) {
        connectionStatusRef.current.classList.add('recording');
        connectionStatusRef.current.textContent = 'Recording...';
        connectionStatusRef.current.style.color = '#f44336'; // Red
      } else if (isWaitingForAI) {
        connectionStatusRef.current.classList.remove('recording');
        connectionStatusRef.current.textContent = 'Waiting for AI response...';
        connectionStatusRef.current.style.color = '#ff9800'; // Orange
      } else if (isConnected) {
        connectionStatusRef.current.classList.remove('recording');
        connectionStatusRef.current.textContent = 'Connected';
        connectionStatusRef.current.style.color = '#4caf50'; // Green
      } else {
        connectionStatusRef.current.classList.remove('recording');
        connectionStatusRef.current.textContent = 'Not Connected';
        connectionStatusRef.current.style.color = '#f44336'; // Red
      }
    }
  };

  // Create meeting
  const createMeeting = async () => {
    setIsLoading(true);
    setError("");
    
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
      
      // Connect to WebSocket for audio using existing mechanism
      try {
        console.log("Connecting to WebSocket:", meetingResponseData.aiAudioUrl);
        const wsConnection = await connectWebSocket(meetingResponseData.aiAudioUrl, meetingResponseData.aiSessionId);
        console.log("WebSocket connected:", wsConnection.readyState);
        setSuccess("Connected to interview AI!");
        setOpenSnackbar(true);
        
        // Only initialize Chime SDK after successful WebSocket connection
        // This ensures we don't waste the Chime connection if WebSocket fails
        if (meetingResponseData.meetingId) {
          try {
            console.log("WebSocket connected, now initializing Chime SDK...");
            await initializeChimeSDK();
            console.log("Chime SDK initialized");
          } catch (sdkError) {
            console.warn("Chime SDK warning:", sdkError);
            // Non-blocking error - we can continue with audio-only if video fails
          }
        }
        
        return true;
      } catch (wsError) {
        console.error("WebSocket connection error:", wsError);
        setError("Connection error. Please try again.");
        setOpenSnackbar(true);
        setIsJoined(true); // Still show interface
      }
      
      return true;
    } catch (error) {
      console.error("Error:", error);
      setError(`Error: ${error.message || "Unknown error"}`);
      setOpenSnackbar(true);
      cleanupMedia();
      cleanupWebSocket();
      cleanupChimeSDK();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Set up video tile observers
  const setupVideoTileObservers = (av) => {
    console.log("Setting up video tile observers...");
    
    av.addObserver({
      videoTileDidUpdate: tileState => {
        console.log("Video tile updated:", {
          tileId: tileState.tileId,
          boundAttendeeId: tileState.boundAttendeeId,
          isLocal: tileState.localTile,
          active: tileState.active,
          size: tileState.tileSize
        });
        
        if (!tileState.boundAttendeeId) {
          console.log("Skipping tile without attendee ID");
          return;
        }
        
        // Handle local video tile
        if (tileState.localTile) {
          console.log(`Binding local video tile ${tileState.tileId} to local video element`);
          if (localVideoRef.current) {
            try {
              av.bindVideoElement(tileState.tileId, localVideoRef.current);
              console.log(`Successfully bound local video tile ${tileState.tileId}`);
            } catch (error) {
              console.error(`Error binding local video tile: ${error.message}`);
            }
          } else {
            console.warn("Local video ref is not available");
          }
          return;
        }
        
        // Handle remote video tiles
        if (remoteVideosRef.current) {
          console.log(`Processing remote video tile ${tileState.tileId} for attendee ${tileState.boundAttendeeId}`);
          let videoElement = document.getElementById(`video-${tileState.tileId}`);
          
          if (!videoElement) {
            console.log(`Creating new video element for remote tile ${tileState.tileId}`);
            
            // Empty the container first to ensure we only show one remote video
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
            
            console.log(`Created video element with id video-${tileState.tileId}`);
          }
          
          try {
            console.log(`Binding remote video tile ${tileState.tileId} to element`);
            av.bindVideoElement(tileState.tileId, videoElement);
            console.log(`Successfully bound remote video tile ${tileState.tileId}`);
            
            // Add debug event listeners to the video element
            videoElement.onloadedmetadata = () => {
              console.log(`Video ${tileState.tileId} metadata loaded:`, {
                videoWidth: videoElement.videoWidth,
                videoHeight: videoElement.videoHeight,
                readyState: videoElement.readyState
              });
            };
            
            videoElement.onplay = () => console.log(`Video ${tileState.tileId} started playing`);
            videoElement.onerror = (e) => console.error(`Video ${tileState.tileId} error:`, e);
          } catch (error) {
            console.error(`Error binding remote video tile: ${error.message}`);
          }
        } else {
          console.warn("Remote videos container ref is not available");
        }
      },
      
      videoTileWasRemoved: tileId => {
        console.log(`Video tile removed: ${tileId}`);
        
        const videoContainer = document.getElementById(`video-container-${tileId}`);
        if (videoContainer) {
          videoContainer.remove();
          console.log(`Removed video container for tile ${tileId}`);
        } else {
          console.warn(`Could not find video container for removed tile ${tileId}`);
        }
      }
    });
  };

  // Get video device - expanded with detailed logging and fallback options
  const getVideoDevice = async () => {
    try {
      console.log("[Video Debug] Enumerating devices...");
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log("[Video Debug] Available devices:", devices);

      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log("[Video Debug] Video devices found:", videoDevices);

      if (videoDevices.length === 0) {
        console.error("[Video Debug] No video devices found!");
        throw new Error('No video devices found');
      }

      console.log("[Video Debug] Requesting video stream from device:", videoDevices[0].label || "Default camera");
      
      // First try with specific device ID
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: videoDevices[0].deviceId,
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          },
          audio: false
        });
        
        console.log("[Video Debug] Video stream obtained successfully with device ID");
        console.log("[Video Debug] Video tracks in stream:", stream.getVideoTracks().length);
        console.log("[Video Debug] First video track settings:", stream.getVideoTracks()[0]?.getSettings());
        
        return stream;
      } catch (deviceError) {
        console.warn("[Video Debug] Failed to get stream with device ID, trying fallback:", deviceError);
        
        // Fallback to simple constraints
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        
        console.log("[Video Debug] Fallback video stream obtained");
        console.log("[Video Debug] Fallback video tracks:", fallbackStream.getVideoTracks().length);
        
        return fallbackStream;
      }
    } catch (error) {
      console.error("[Video Debug] Error getting video device:", error);
      throw error;
    }
  };

  const getAudioDevice = async () => {
    try {
      console.log("[Audio Debug] Enumerating devices...");
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log("[Audio Debug] Available devices:", devices);
  
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      console.log("[Audio Debug] Audio devices found:", audioDevices);
  
      if (audioDevices.length === 0) {
        console.error("[Audio Debug] No audio devices found!");
        throw new Error('No audio devices found');
      }
  
      console.log("[Audio Debug] Requesting audio stream from device:", audioDevices[0].label || "Default microphone");
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: audioDevices[0].deviceId,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        },
        video: false
      });
      
      console.log("[Audio Debug] Audio stream obtained successfully");
      return stream;
    } catch (error) {
      console.error("[Audio Debug] Error getting audio device:", error);
      throw error;
    }
  };
  

  // Connect to WebSocket - maintaining the exact connection method from original code
  const connectWebSocket = async (websocketUrl, sessionId) => {
    try {
      // Clean up existing connections
      if (websocket) {
        try {
          websocket.close();
        } catch (e) {
          console.log('Error closing websocket:', e);
        }
      }
      
      let finalWebsocketUrl = websocketUrl;

      if (websocketUrl.startsWith('https://')) {
          // If API is HTTPS, WebSocket should be WSS.
          // Handles ws:// and http:// (if backend sends http for websocket path)
          if (finalWebsocketUrl.startsWith('ws://')) {
              finalWebsocketUrl = 'wss://' + finalWebsocketUrl.substring('ws://'.length);
          } else if (finalWebsocketUrl.startsWith('http://')) {
              finalWebsocketUrl = 'wss://' + finalWebsocketUrl.substring('http://'.length);
          } else if (finalWebsocketUrl.startsWith('https://')) {
              // If backend sends https:// for a websocket URL, convert to wss://
              finalWebsocketUrl = 'wss://' + finalWebsocketUrl.substring('https://'.length);
          }
      } else if (websocketUrl.startsWith('http://')) {
          // If API is HTTP, WebSocket should be WS.
          // Handles wss:// and https:// (if backend sends https for websocket path)
          if (finalWebsocketUrl.startsWith('wss://')) {
              finalWebsocketUrl = 'ws://' + finalWebsocketUrl.substring('wss://'.length);
          } else if (finalWebsocketUrl.startsWith('https://')) {
              finalWebsocketUrl = 'ws://' + finalWebsocketUrl.substring('https://'.length);
          } else if (finalWebsocketUrl.startsWith('http://')) {
              // If backend sends http:// for a websocket URL, convert to ws://
              finalWebsocketUrl = 'ws://' + finalWebsocketUrl.substring('http://'.length);
          }
      }
      console.log('WebSocket URL:', websocketUrl);
      
      // Create connection
      return new Promise((resolve, reject) => {
        const ws = new WebSocket(websocketUrl);
        ws.binaryType = 'arraybuffer';
        
        const connectionTimeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            ws.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);
        
        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          setIsConnected(true);
          
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
          }, 15000);
          
          setWebsocket(ws);
          resolve(ws);
        };
        
        ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          setIsConnected(false);
          
          if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
          }
          
          if (event.code !== 1000 && isJoined && !interviewEnded) {
            setError(`Connection closed: ${event.reason || 'Unknown reason'}`);
            setOpenSnackbar(true);
          }
          
          reject(new Error(`Connection closed: ${event.reason || 'Unknown'}`));
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          if (!interviewEnded) {
            setError('Connection error. Attempting to reconnect...');
            setOpenSnackbar(true);
            
            // Auto-reconnect
            setTimeout(() => {
              if (!isConnected && !interviewEnded) {
                connectWebSocket(websocketUrl, sessionId)
                  .then(newWs => {
                    setSuccess('Reconnected!');
                    setOpenSnackbar(true);
                  })
                  .catch(err => {
                    setError('Reconnection failed');
                    setOpenSnackbar(true);
                  });
              }
            }, 3000);
          }
        };
        
        ws.onmessage = handleWebSocketMessage;
      });
    } catch (error) {
      console.error('WebSocket setup error:', error);
      throw error;
    }
  };

  // Handle WebSocket messages
  const handleWebSocketMessage = (event) => {
    try {
      // Handle binary (audio) data
      if (event.data instanceof ArrayBuffer) {
        playReceivedAudio(event.data);
        return;
      }
      
      // Handle JSON messages
      const message = JSON.parse(event.data);
      console.log("Received message:", message);
      
      switch (message.type) {
        case 'transcript':
          // Add to transcripts
          setTranscripts(prev => [...prev, message]);
          
          // If this is an AI transcript, mark that we're ready for user input again
          if (message.speaker === 'ai') {
            setIsWaitingForAI(false);
            updateButtonStates();
          }
          break;
          
        case 'audio':
          if (message.data) {
            // Decode base64 audio
            const audioData = atob(message.data);
            const arrayBuffer = new ArrayBuffer(audioData.length);
            const view = new Uint8Array(arrayBuffer);
            
            for (let i = 0; i < audioData.length; i++) {
              view[i] = audioData.charCodeAt(i);
            }
            
            playReceivedAudio(arrayBuffer, message.sample_rate, message.encoding);
          }
          break;
          
        case 'heartbeat':
          console.log('Heartbeat received');
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
    console.log('Event message:', message);
    
    if (message.event === 'error') {
      setError(message.data?.message || "Unknown error occurred");
      setOpenSnackbar(true);
    } else if (message.event === 'session_end' || message.event === 'interview_complete') {
      setSuccess('Interview completed: ' + (message.data?.reason || 'successfully'));
      setOpenSnackbar(true);
      setInterviewEnded(true);
      updateButtonStates();
    } else if (message.event === 'processing_start') {
      // AI is processing user input, mark as waiting for AI response
      setIsWaitingForAI(true);
      updateButtonStates();
    } else if (message.event === 'processing_complete') {
      // AI has finished processing and will send response soon
      // Keeping isWaitingForAI true until we receive the transcript
    }
  };

  // Start recording with improved buffering
  const startRecording = async () => {
    try {
      // First initialize Chime SDK if not already done
      if (!meetingSession || !audioVideo) {
        console.log("No active meeting session. Initializing Chime SDK...");
        
        if (!currentMeeting || !currentMeeting.meetingId) {
          throw new Error("No meeting data available. Please ensure meeting is created first.");
        }
        
        await initializeChimeSDK();
      }
      
      // Get audio stream for WebSocket (same as before)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });
      
      setAudioStream(stream);
      
      // Create audio context
      const context = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });
      
      setAudioContext(context);
      
      // Create audio pipeline
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      audioAnalyserRef.current = analyser;
      
      source.connect(analyser);
      
      const bufferSize = 4096;
      const processor = context.createScriptProcessor(bufferSize, 1, 1);
      
      source.connect(processor);
      processor.connect(context.destination);
      
      // Set recording to true immediately
      setIsRecording(true);
      
      // Clear existing buffer
      audioDataBufferRef.current = [];
      
      // Reset silence detection state
      setSilenceTime(0);
      setIsSpeaking(false);
      
      // Start silence detection timer
      silenceTimerRef.current = setInterval(() => {
        if (isRecordingRef.current && audioAnalyserRef.current) {
          // Get current audio level from the analyzer
          const dataArray = new Uint8Array(audioAnalyserRef.current.frequencyBinCount);
          audioAnalyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculate average level
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          
          // Check if we're in a silence period
          checkForSilence(average);
        }
      }, 100); // Check every 100ms
      
      // Process audio - with improved buffering for complete sentences
      processor.onaudioprocess = (e) => {
        if (!isRecordingRef.current || !websocket || websocket.readyState !== WebSocket.OPEN) {
          return;
        }
        
        // Get audio data
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Convert to 16-bit PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.min(1, Math.max(-1, inputData[i])) * 32767;
        }
        
        // Calculate average volume for audio level display
        let sum = 0;
        for (let i = 0; i < pcmData.length; i++) {
          sum += Math.abs(pcmData[i]);
        }
        const average = sum / pcmData.length / 32767 * 100;
        
        // Update level indicator
        if (audioLevelIndicatorRef.current) {
          audioLevelIndicatorRef.current.style.width = `${Math.min(100, average * 2)}%`;
        }
        
        // Add to buffer instead of sending immediately
        audioDataBufferRef.current.push(pcmData);
        
        // Buffer more audio data before sending (about 1 second)
        // This helps prevent sentence fragmentation
        if (audioDataBufferRef.current.length >= 10) {
          flushAudioBuffer();
        }
      };
      
      // NEW CODE: Start audio and video for Chime SDK together
      try {
        console.log("Setting up Chime SDK audio and video...");
        
        // Set up audio for Chime SDK
        const chimeAudioStream = await getAudioDevice();
        if (audioVideo) {
          console.log("Starting audio input with Chime SDK...");
          await audioVideo.startAudioInput(chimeAudioStream);
          console.log("Chime SDK audio input started successfully");
        }
        
        // Set up video for Chime SDK
        console.log("Getting video device...");
        const videoStream = await getVideoDevice();
        
        // First set the video in our own UI component
        if (localVideoRef.current && videoStream) {
          localVideoRef.current.srcObject = videoStream;
        }
        
        // Then connect it to Chime SDK
        if (audioVideo) {
          try {
            console.log("Starting video input with Chime SDK...");
            await audioVideo.startVideoInput(videoStream);
            console.log("Starting local video tile...");
            audioVideo.startLocalVideoTile();
            console.log("Video started successfully");
          } catch (videoError) {
            console.error("Chime SDK video error:", videoError);
            // Continue even if video fails, audio is more important
          }
        }
        
        setVideoEnabled(true);
        setCameraEnabled(true);
      } catch (mediaError) {
        console.error("Error setting up Chime SDK media:", mediaError);
        // Continue with WebSocket recording even if Chime media setup fails
      }
      
      updateButtonStates();
      
    } catch (error) {
      console.error('Microphone error:', error);
      setError('Cannot access microphone: ' + error.message);
      setOpenSnackbar(true);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (!isRecording) return;
    
    console.log("Stopping recording");
    setIsRecording(false);
    
    // After stopping recording, set waiting for AI flag to true
    // This will disable the start recording button until AI responds
    setIsWaitingForAI(true);
    
    // Clear silence detection timer
    if (silenceTimerRef.current) {
      clearInterval(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    // Flush any remaining audio
    flushAudioBuffer();
    
    // Stop WebSocket audio
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
    
    // Close audio context
    if (audioContext) {
      if (audioContext.state !== 'closed') {
        audioContext.close().catch(err => console.error('Error closing audio context:', err));
      }
      setAudioContext(null);
    }
    
    // Reset audio level
    if (audioLevelIndicatorRef.current) {
      audioLevelIndicatorRef.current.style.width = '0%';
    }
    
    // Stop Chime SDK video
    if (videoEnabled) {
      try {
        if (audioVideo) {
          audioVideo.stopLocalVideoTile();
          audioVideo.stopVideoInput();
        }
        
        if (localVideoRef.current && localVideoRef.current.srcObject) {
          const tracks = localVideoRef.current.srcObject.getVideoTracks();
          tracks.forEach(track => track.stop());
          localVideoRef.current.srcObject = null;
        }
      } catch (error) {
        console.error("Error stopping video:", error);
      }
    }
    
    // Also stop Chime SDK audio
    try {
      if (audioVideo) {
        audioVideo.stopAudioInput();
        console.log("Chime SDK audio input stopped");
      }
    } catch (error) {
      console.error("Error stopping Chime SDK audio:", error);
    }
    
    setVideoEnabled(false);
    setCameraEnabled(false);
    
    updateButtonStates();
  };

  // Play received audio
  const playReceivedAudio = (audioData, sampleRate = 16000, encoding = 'pcm_s16le') => {
    if (!audioData) return;
    
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      let audioBuffer;
      
      if (encoding === 'pcm_f32le') {
        // 32-bit float PCM
        const floatArray = new Float32Array(audioData.byteLength / 4);
        const dataView = new DataView(audioData);
        
        for (let i = 0; i < floatArray.length; i++) {
          floatArray[i] = dataView.getFloat32(i * 4, true);
        }
        
        audioBuffer = context.createBuffer(1, floatArray.length, sampleRate);
        audioBuffer.getChannelData(0).set(floatArray);
      } else {
        // 16-bit PCM
        const int16Array = new Int16Array(audioData);
        const floatArray = new Float32Array(int16Array.length);
        
        for (let i = 0; i < int16Array.length; i++) {
          floatArray[i] = int16Array[i] / 32768.0;
        }
        
        audioBuffer = context.createBuffer(1, floatArray.length, sampleRate);
        audioBuffer.getChannelData(0).set(floatArray);
      }
      
      // Play audio
      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      
      const gainNode = context.createGain();
      gainNode.gain.value = volume / 100;
      
      source.connect(gainNode);
      gainNode.connect(context.destination);
      
      source.start();
      
      source.onended = () => context.close();
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  // Clean up media resources
  const cleanupMedia = () => {
    console.log("Cleaning up media resources");
    
    if (isRecording) setIsRecording(false);
    
    if (silenceTimerRef.current) {
      clearInterval(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }

    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch(e => console.error('Error closing audio context:', e));
      setAudioContext(null);
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    audioDataBufferRef.current = [];
    audioAnalyserRef.current = null;
  };

  // Clean up WebSocket
  const cleanupWebSocket = () => {
    console.log("Cleaning up WebSocket connection");
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    if (websocket && websocket.readyState !== WebSocket.CLOSED) {
      websocket.close(1000, 'Normal closure');
      setWebsocket(null);
    }
    
    setIsConnected(false);
  };

  // Clean up Chime SDK
  const cleanupChimeSDK = () => {
    console.log("Cleaning up Chime SDK");
    
    if (audioVideo) {
      try {
        // Stop video if enabled
        if (videoEnabled) {
          console.log("Stopping local video tile");
          try {
            audioVideo.stopLocalVideoTile();
          } catch (tileError) {
            console.error("Error stopping local video tile:", tileError);
          }
          
          console.log("Stopping video input");
          try {
            audioVideo.stopVideoInput();
          } catch (inputError) {
            console.error("Error stopping video input:", inputError);
          }
        }
        
        // Stop audio input (NEW)
        try {
          console.log("Stopping audio input");
          audioVideo.stopAudioInput();
        } catch (audioError) {
          console.error("Error stopping audio input:", audioError);
        }
        
        // Stop the audio video session
        console.log("Stopping Chime SDK session");
        try {
          audioVideo.stop();
        } catch (stopError) {
          console.error("Error stopping audio/video session:", stopError);
        }
      } catch (error) {
        console.error("Error during Chime SDK cleanup:", error);
      }
    } else {
      console.log("No audioVideo instance to clean up");
    }
    
    // Clean up any outstanding video elements in the remote container
    if (remoteVideosRef.current) {
      while (remoteVideosRef.current.firstChild) {
        remoteVideosRef.current.removeChild(remoteVideosRef.current.firstChild);
      }
    }
    
    // Reset state
    setAudioVideo(null);
    setMeetingSession(null);
    setVideoEnabled(false);
    setCameraEnabled(false);
    
    console.log("Chime SDK cleanup complete");
  };  

  // Handle the dialog open
  const handleEndDialogOpen = () => {
    setOpenEndDialog(true);
  };

  // Handle the dialog close
  const handleEndDialogClose = () => {
    setOpenEndDialog(false);
  };

  // End meeting
  const endMeeting = async () => {
    handleEndDialogClose();
    
    if (!currentMeeting?.meetingId) {
      setError('No active meeting');
      setOpenSnackbar(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Stop recording if active
      if (isRecording) {
        stopRecording();
      }
      
      // Stop video if active
      if (videoEnabled) {
        stopVideo();
      }
      
      cleanupMedia();
      cleanupWebSocket();
      cleanupChimeSDK();
      
      await MeetingService.deleteMeeting(interviewId, currentMeeting.meetingId);
      
      setSuccess("Interview ended. Thank you for your participation!");
      setOpenSnackbar(true);
      
      setInterviewEnded(true);
      updateButtonStates();
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
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <Box p={3}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Interview in Progress
                </Typography>
                
                <Typography variant="body2" mb={2}>
                  Status: <span 
                    ref={connectionStatusRef}
                    className={isRecording ? 'recording' : ''}
                    style={{ 
                      fontWeight: 'bold', 
                      color: isRecording ? '#f44336' : 
                             isWaitingForAI ? '#ff9800' : 
                             isConnected ? '#4caf50' : '#f44336' 
                    }}
                  >
                    {isRecording ? 'Recording...' : 
                     isWaitingForAI ? 'Waiting for AI response...' : 
                     isConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Left side - Video and controls */}
                  <Grid item xs={12} md={6}>
                    {/* Main video container */}
                    <Box mb={2}>
                      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                        You
                      </Typography>
                      
                      {/* Local Video Display */}
                      <Box 
                        width="100%" 
                        height="240px" 
                        border="1px solid #ccc" 
                        borderRadius="5px"
                        overflow="hidden"
                        position="relative"
                        mb={2}
                        bgcolor={!cameraEnabled ? "#f5f5f5" : undefined}
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
                          <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="100%"
                          >
                            <Typography variant="body1" color="text.secondary">
                              Camera Off
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    
                    {/* Audio level indicator */}
                    <Box width="100%" height="20px" bgcolor="#eee" mb={2}>
                      <Box 
                        height="100%" 
                        width="0%" 
                        bgcolor="#4CAF50"
                        ref={audioLevelIndicatorRef}
                        sx={{ transition: 'width 0.1s' }}
                      />
                    </Box>
                    
                    {/* Controls */}
                    <Box display="flex" justifyContent="space-between" gap={2} mb={2}>
                      <Button
                        id="toggle-video-btn"
                        variant="contained"
                        color={videoEnabled ? "primary" : "secondary"}
                        onClick={toggleVideo}
                        disabled={interviewEnded}
                        fullWidth
                        startIcon={videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                      >
                        {videoEnabled ? "Disable Video" : "Enable Video"}
                      </Button>

                      <Button
                        id="toggle-recording-btn"
                        ref={startRecordingBtnRef}
                        variant="contained"
                        color={isRecording ? "error" : "success"}
                        onClick={toggleRecording}
                        disabled={!isConnected || isWaitingForAI || interviewEnded}
                        fullWidth
                        startIcon={<MicIcon />}
                      >
                        {isRecording ? "Stop Interview" : "Start Interview"}
                      </Button>
                    </Box>
                    
                    <Button
                      id="end-session-btn"
                      variant="contained"
                      color="primary"
                      onClick={handleEndDialogOpen}
                      fullWidth
                      startIcon={<ExitToAppIcon />}
                    >
                      End Interview
                    </Button>
                    
                    <Box mt={2}>
                      <Typography variant="body2" color="text.secondary">
                        Tips: Click "Start Interview" to begin talking to the AI interviewer. The system will automatically detect pauses in your speech. Enable video to share your camera.
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    {/* Remote Videos */}
                    <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                        AI Interviewer
                      </Typography>
                      
                      <Box 
                        width="100%" 
                        height="120px" 
                        border="1px solid #ccc" 
                        borderRadius="5px"
                        overflow="hidden"
                        mb={2}
                        bgcolor="#f5f5f5"
                        ref={remoteVideosRef}
                        id="remote-videos"
                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {isConnected ? "Waiting for AI video feed..." : "Not connected"}
                        </Typography>
                      </Box>
                  </Grid>
                  {/* Right side - Transcripts */}
                  {/* <Grid item xs={12} md={6}>
                    <Box 
                      id="transcript-container"
                      width="100%" 
                      height="430px"
                      sx={{ overflowY: 'auto' }}
                      p={2}
                      border="1px solid #ccc"
                      borderRadius="5px"
                    >
                      {transcripts.length > 0 ? (
                        transcripts.map((transcript, index) => (
                          <Box 
                            key={index} 
                            mb={1}
                            p={2}
                            borderRadius="5px"
                            bgcolor={transcript.speaker === 'human' ? '#e3f2fd' : '#f1f8e9'}
                          >
                            <Typography variant="body2">
                              <strong>{transcript.speaker === 'human' ? 'Me: ' : 'AI Interviewer: '}</strong>
                              {transcript.text}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" height="90%">
                          <Typography variant="body2" color="text.secondary">
                            The interview hasn't started yet. Click "Start Interview" to begin talking to the AI interviewer.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid> */}
                </Grid>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* End Interview Confirmation Dialog */}
      <Dialog
        open={openEndDialog}
        onClose={handleEndDialogClose}
        aria-labelledby="end-interview-dialog-title"
        aria-describedby="end-interview-dialog-description"
      >
        <DialogTitle id="end-interview-dialog-title">
          End Interview
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="end-interview-dialog-description">
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