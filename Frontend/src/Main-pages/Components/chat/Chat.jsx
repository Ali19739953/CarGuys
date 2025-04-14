import { useEffect, useRef, useState, useMemo, useReducer } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { firestore } from "@/firebaseConfig";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import { format } from "timeago.js";
import { Timestamp } from "firebase/firestore";
import { arrayRemove } from "firebase/firestore";
import reverseGeocode from "../../../api/reverseGeocode.js";

const Chat = () => {
  const [chatUser, setChatUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [img, setImg] = useState({ file: null, url: "" });
  const [pdf, setPdf] = useState({ file: null, url: "" });

  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const { currentUser, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  const endRef = useRef(null);
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);
  const [showMediaModal, setShowMediaModal] = useState(false); 
  const [showPdfModal, setShowPdfModal] = useState(false);

  

const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const [location, setLocation] = useState("");

  
  
 

  // Scroll to the latest message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sharedImages = useMemo(
    () => messages.filter((message) => message.img), 
    [messages]
  );


  // Fetch user chats and set chat user
  useEffect(() => {
    if (!chatId) {
      console.log("No chatId provided.");
      return;
    }

    const fetchChatUser = async () => {
      try {
        const userChatsRef = doc(firestore, "userchats", currentUser.uid);
        const userChatsSnapshot = await getDoc(userChatsRef);
    
        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatData = userChatsData?.chats?.find((chat) => chat.chatId === chatId);
    
          if (chatData && chatData.user) {
            let receiverRef = doc(firestore, "Garage Users", chatData.user.uid);
            let receiverSnap = await getDoc(receiverRef);
    
            if (!receiverSnap.exists()) {
              receiverRef = doc(firestore, "ServiceSeekers Users", chatData.user.uid);
              receiverSnap = await getDoc(receiverRef);
            }
    
            if (receiverSnap.exists()) {
              const receiverData = receiverSnap.data();
              chatData.user.avatar = receiverData.profileImageUrl || "./avatar.png";
              setChatUser(chatData.user);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching chat user:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatUser();
  }, [chatId]);

  // Fetch messages from chats collection
  useEffect(() => {
    if (!chatId) return;

    const unSubChatMessages = onSnapshot(doc(firestore, "chats", chatId), (doc) => {
      if (doc.exists()) {
        setMessages(doc.data().messages || []);
      }
      forceUpdate();
    });

    return () => unSubChatMessages();
  }, [chatId]);

  // Fetch user data
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handlePdf = (e) => {
    if (e.target.files[0]) {
      setPdf({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
      setShowPdfModal(true);  // Open modal when PDF is selected
    }
  };
  
  

  const handleSend = async () => {
    if (!currentUser?.uid || !chatId || (!text.trim() && !img.file && !audioBlob && !pdf.file)) {
        return;
    }
  
    let imgUrl = null;
    let audioUrl = null;
    let pdfUrl = null;
  
    try {
        // Upload image if present
        if (img.file) {
            imgUrl = await upload(img.file);
        }
  
        // Upload audio if present
        if (audioBlob) {
            audioUrl = await upload(audioBlob);
        }
  
        // Upload PDF if present
        if (pdf.file) {
            pdfUrl = await upload(pdf.file); // Assuming you have an upload function for PDF files
        }
  
        const newMessage = {
            senderId: currentUser.uid,
            text: text.trim() || null,
            createdAt: Timestamp.fromDate(new Date()),
            ...(imgUrl && { img: imgUrl }),
            ...(audioUrl && { audio: audioUrl }),
            ...(pdfUrl && { pdf: pdfUrl }), // Send PDF URL
        };
  
        // Send message to the chats collection
        await updateDoc(doc(firestore, "chats", chatId), {
            messages: arrayUnion(newMessage),
            lastMessage: pdfUrl
                ? "PDF document"
                : audioUrl
                ? "Audio message"
                : imgUrl
                ? "Image"
                : text.trim() || "Message sent",
        });
  
        // Update lastMessage for both users (current user and the receiver)
        const userIDs = [currentUser.uid, chatUser?.uid]; // Make sure we also update the receiver's lastMessage
        userIDs.forEach(async (uid) => {
            const userChatsRef = doc(firestore, "userchats", uid);
            const userChatsSnapshot = await getDoc(userChatsRef);
  
            if (userChatsSnapshot.exists()) {
                const userChatsData = userChatsSnapshot.data();
                const chatIndex = userChatsData.chats.findIndex(
                    (c) => c.chatId === chatId
                );
  
                if (chatIndex !== -1) {
                    // Update lastMessage accordingly in the user chat
                    userChatsData.chats[chatIndex].lastMessage = pdfUrl
                        ? "PDF document"
                        : audioUrl
                        ? "Audio message"
                        : imgUrl
                        ? "Image"
                        : text.trim() || "Message sent";
  
                    await updateDoc(userChatsRef, {
                        chats: userChatsData.chats,
                    });
                }
            }
        });
    } catch (err) {
        console.error("Error sending message:", err);
    } finally {
        setPdf({ file: null, url: "" });
        setImg({ file: null, url: "" });
        setText("");
        setAudioBlob(null);
    }
};

  
useEffect(() => {
  if (chatUser) {
    let lat, lng;

    // Safely access properties using optional chaining
    if (chatUser?.user_type === "GarageManagers" && chatUser?.garage_location) {
      lat = chatUser.garage_location?.lat;
      lng = chatUser.garage_location?.lng;
    } else if (chatUser?.user_type === "ServiceSeeker" && chatUser?.location) {
      lat = chatUser.location?.lat;
      lng = chatUser.location?.lng;
    }

    console.log("User Location:", lat, lng); // Log location data to verify

    if (lat && lng) {
      reverseGeocode(lat, lng)
        .then((address) => {
          if (address) {
            setLocation(address); // Set the resolved location if found
          } else {
            setLocation("Location not available"); // Fallback if reverseGeocode fails
          }
        })
        .catch((error) => {
          console.error("Error fetching address:", error);
          setLocation("Location not available");
        });
    } else {
      setLocation("Location not available");
    }
  }
}, [chatUser]);


const openInGoogleMaps = () => {
  let lat, lng;
  if (chatUser?.user_type === "GarageManagers" && chatUser?.garage_location) {
    lat = chatUser.garage_location?.lat;
    lng = chatUser.garage_location?.lng;
  } else if (chatUser?.user_type === "ServiceSeeker" && chatUser?.location) {
    lat = chatUser.location?.lat;
    lng = chatUser.location?.lng;
  }
    if (lat && lng) {
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(googleMapsUrl, "_blank");
    } else {
      console.error("Latitude or longitude is missing.");
    }
  
};


  
  const handleRejectAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null); // Reset the audio URL
  };

  const handleDeleteMessage = async (messageToDelete) => {
    try {
      // Remove the message from the messages array in the chat document
      await updateDoc(doc(firestore, "chats", chatId), {
        messages: arrayRemove(messageToDelete),
      });
  
      // Fetch the updated messages to determine the new last message
      const chatDoc = await getDoc(doc(firestore, "chats", chatId));
      const updatedMessages = chatDoc.data().messages || [];
  
      // Determine the new last message based on the remaining messages
      const newLastMessage = updatedMessages.length > 0
        ? updatedMessages[updatedMessages.length - 1]
        : null;
  
      // Update the last message in each user's chat document
      const userIDs = [currentUser.uid];
      userIDs.forEach(async (uid) => {
        const userChatsRef = doc(firestore, "userchats", uid);
        const userChatsSnapshot = await getDoc(userChatsRef);
  
        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );
  
          if (chatIndex !== -1) {
            // Update lastMessage with the new last message or set to null if no messages are left
            userChatsData.chats[chatIndex].lastMessage = newLastMessage
              ? newLastMessage.audio ? "Audio message" 
              : newLastMessage.img ? "Image" 
              : newLastMessage.text || "Message deleted"
              : null;
            userChatsData.chats[chatIndex].updatedAt = Date.now();
  
            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      });
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };
  

  const handleRejectImage = () => setImg({ file: null, url: "" });

  const startRecording = () => {
    if (!navigator.mediaDevices) {
      alert("Audio recording not supported on this browser.");
      return;
    }
  
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.start();
        setIsRecording(true);
  
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setAudioBlob(event.data);  // Ensure the audio data is captured
            const audioUrl = URL.createObjectURL(event.data);
            setAudioUrl(audioUrl); // Create a URL for playback
          }
        };
  
        mediaRecorderRef.current.onstop = () => {
          setIsRecording(false);
        };
      })
      .catch((err) => {
        console.error("Error accessing microphone:", err);
      });
  };
  
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };
  
 

  const renderedMessages = useMemo(() => (
    messages.map((message, index) => (
      <div
        className={message.senderId === currentUser?.uid ? "message own" : "message"}
        key={`${message.createdAt?.seconds}-${index}`}
      >
        <div className="Chat_texts">
          <div className="Chat_texts_text">
          {message.img && (
  <div className="image-container">
    <img src={message.img} alt="Image" />
    <a href={message.img} download className="ImageDownloadButton">
      <img src="/icon/download.png" alt="Download Icon" className="download-icon-img" />
      
    </a>
  </div>
)}


            <p>{message.text}</p>
            {message.pdf && (
  <div className="pdf-container">
    <iframe 
      src={message.pdf} 
      title="PDF Document" 
      width="100%" 
      height="300px" 
      frameBorder="0"
    />
    <a href={message.pdf} target="_blank" rel="noopener noreferrer">
      <button className="DownloadPdfButton">
        Download PDF
      </button>
    </a>
  </div>
)}

            {message.audio && (
              <audio controls className="Chat_texts_audio">
                <source src={message.audio} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            )}
            {message.senderId === currentUser?.uid && (
              <button
                className="delete-button-chat"
                onClick={() => handleDeleteMessage(message)}
              >
                🗑️
              </button>
            )}
          </div>
          <div>
            <span className="Chat_texts_Timestamp">
              {typeof message.createdAt === 'object'
                ? format(message.createdAt.toDate())
                : format(new Date(message.createdAt))}
            </span>
          </div>
        </div>
      </div>
    ))
  ), [messages, currentUser.uid]);
  
 
  
  

  return (
    <div className="Chat_chat">
   
    <div className="Chat_top">
      <div className="Chat_user">
        <img src={chatUser?.avatar || "./avatar.png"} alt="" />
        <div className="Chat_top_texts">
          <div className="Chat_top_texts_NameandLocation">
  <span>
    {loading ? "Loading..." : (chatUser?.garage_name || `${chatUser?.first_name || ''} ${chatUser?.last_name || ''}` || 'Unknown User')}
  </span>
  <span>
    {location ? location : `Location not available`}
  </span>
  </div>
</div>

      </div>
      <div className="Chat_icons">
        <button onClick={() => setShowMediaModal(true)}>Shared Media</button> {/* Shared Media Button */}
        <img src="/icon/info.png" alt="Info" onClick={() => setShowModal(true)} /> {/* User info button */}
      </div>
    </div>

      <div className="Chat_center">
        {loading ? (
          <div>Loading...</div>
        ) : renderedMessages.length > 0 ? (
          renderedMessages
        ) : (
          <div></div>
        )}
        <div ref={endRef} />
      </div>

      <div className="Chat_bottom">
        <div className="Chat_icons">
          <label htmlFor="file">
            <img src="/icon/img.png" alt="" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
          />
           <label htmlFor="pdf">
    <img src="/icon/download-pdf.png" alt="PDF Icon" />
  </label>
  <input
    type="file"
    id="pdf"
    style={{ display: "none" }}
    accept="application/pdf"
    onChange={handlePdf}
  />
          <div className="voicenote_buton">

          {showRecordingModal && (
  <div className="ShowRecordingModal">
    <div className="ShowRecordingModalOverlay" onClick={() => setShowRecordingModal(false)}></div>
    <div className="ShowRecordingModalContent">
      
      {/* Conditional Message */}
      <div className="ShowRecordingModalContent_Message">
        {isRecording ? (
          <p>Careful...You're being recorded.</p>
        ) : (
          audioUrl ? <p>Audio ready for review</p> : <p>Click the mic to start recording</p>
        )}
      </div>

      {/* Record Button */}
      <div className="ShowRecordingModalContent_RecordButton">
        {isRecording ? (
          <img src="/icon/voice-search.png" alt="Stop Recording" onClick={stopRecording} className="ShowRecordingModalStopPlay"/>
        ) : (
          <img src="/icon/voice-search-start.png" alt="Start Recording" onClick={startRecording} className="ShowRecordingModalStartPlay"/>
        )}
      </div>

      {/* Audio and Buttons */}
      <div className={`ShowRecordingModalContent_AudioandButtons ${audioUrl ? "recordedAudioBackground" : ""}`}>
        {audioUrl && (
          <>
            <audio src={audioUrl} controls />
            <div className="ShowRecordingModalContent_AudioandButtons_Buttons">
              <button onClick={handleRejectAudio} className="ShowRecordingModalContent_AudioandButtons_Reject">Reject</button>
              <button onClick={() => { handleSend(); setShowRecordingModal(false); }} className="ShowRecordingModalContent_AudioandButtons_Send">Send</button>
            </div>
          </>
        )}
      </div>

      {/* Close Button */}
      <button onClick={() => setShowRecordingModal(false)} className="ShowRecordingModalContent_Close">Close</button>
    </div>
  </div>
)}
 <div>
          <img src="/icon/destination.png" onClick={openInGoogleMaps}/>
        </div>
        
        </div>
          
          <img src="/icon/mic.png" alt="" onClick={() => setShowRecordingModal(true)} />
        </div>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
        />
       

        <div className="Chat_emoji">
          <img
            src="/icon/emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="Chat_picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className="ChatBottonButtonsSend" onClick={handleSend}>Send</button>
      </div>

      {img.url && (
        <div className="ChatImgModal">
          <div className="ChatImgModalOverlay">
            <img src={img.url} alt="ChatImgPreview" />
            <div className="ChatImgModalButtons">
              <button className="ChatImgModalButtonsReject " onClick={handleRejectImage}>Reject</button>
              <button className="ChatImgModalButtonsSend" onClick={handleSend}>Send</button>
            </div>
          </div>
        </div>
      )}

{showPdfModal && (
  <div className="pdf-modal">
    <div className="pdf-modal-content">
      <iframe
        src={pdf.url}
        title="PDF Document"
        width="100%"
        height="300px"
        frameBorder="0"
      />
      <div className="pdf-modal-actions">
  <button
    onClick={() => {
      setShowPdfModal(false); 
      setPdf({ file: null, url: "" });
    }}
  >
    Reject
  </button>
  <button
    onClick={() => {
      handleSend(); 
      setShowPdfModal(false); 
    }}
  >
    Send
  </button>
</div>
    </div>
  </div>
)}


      
{showMediaModal && (
        <div className="SharedMediaModal">
          <div className="SharedMediaModalOverlay" onClick={() => setShowMediaModal(false)}></div>
          <div className="SharedMediaModalContent">
            <h3>Shared Media</h3>
            <div className="SharedMediaGallery">
              {sharedImages.length > 0 ? (
                sharedImages.map((message, index) => (
                  <img
                    key={index}
                    src={message.img}
                    alt={`Shared media ${index + 1}`}
                    className="SharedMediaImage"
                  />
                ))
              ) : (
                <p>No images shared yet.</p>
              )}
            </div>
            <button onClick={() => setShowMediaModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Modal for displaying user information */}
      {showModal && (
  <div className="ChatUserModal">
    <div className="ChatUserModalOverlay" onClick={() => setShowModal(false)}></div>
    <div className="ChatUserModalContent">
      <div className="ChatUserModalContentHeading">
      <h3>User Information</h3>
      </div>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <tbody>
          <tr style={{ borderBottom: "1px solid #FFA500", borderTop: "1px solid #FFA500", borderRight:  "1px solid #FFA500", borderLeft: "1px solid #FFA500"}}>
            <td style={{ padding: "8px", borderRight: "1px solid #FFA500" }}><strong>Name</strong></td>
            <td style={{ padding: "8px" }}>{chatUser?.garage_name || `${chatUser?.first_name} ${chatUser?.last_name}` || 'Unknown User'}</td>
          </tr>
          <tr style={{ borderBottom: "1px solid #FFA500", borderRight:  "1px solid #FFA500", borderLeft: "1px solid #FFA500" }}>
            <td style={{ padding: "8px", borderRight: "1px solid #FFA500" }}><strong>Account type</strong></td>
            <td style={{ padding: "8px" }}>
              {chatUser?.user_type === "GarageManagers" ? "Garage User" : "Regular User"}
            </td>
          </tr>
          <tr style={{ borderBottom: "1px solid #FFA500", borderRight:  "1px solid #FFA500", borderLeft: "1px solid #FFA500" }}>
            <td style={{ padding: "8px", borderRight: "1px solid #FFA500" }}><strong>Email</strong></td>
            <td style={{ padding: "8px" }}>{chatUser?.email || 'N/A'}</td>
          </tr>
          <tr style={{ borderBottom: "1px solid #FFA500", borderRight:  "1px solid #FFA500", borderLeft: "1px solid #FFA500" }}>
            <td style={{ padding: "8px", borderRight: "1px solid #FFA500" }}><strong>Location</strong></td>
            <td style={{ padding: "8px" }}>{location || 'N/A'}</td>
          </tr>
          <tr style={{ borderBottom: "1px solid #FFA500", borderRight:  "1px solid #FFA500", borderLeft: "1px solid #FFA500" }}>
            <td style={{ padding: "8px", borderRight: "1px solid #FFA500" }}><strong>Phone</strong></td>
            <td style={{ padding: "8px" }}>
              {chatUser?.user_type === "GarageManagers"
                ? chatUser?.garage_phonenumber || "N/A"
                : chatUser?.phonenumber || "To be added in database"}
            </td>
          </tr>
        </tbody>
      </table>
      <button onClick={() => setShowModal(false)}>Close</button>
    </div>
  </div>
)}


    </div>
  );
};

export default Chat;


