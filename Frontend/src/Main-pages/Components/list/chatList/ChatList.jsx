import { useEffect, useState } from "react";
import styles from "./chatList.module.css"; 
import AddUser from "./addUser/addUser";
import { useUserStore } from "../../../lib/userStore";
import { firestore } from '@/firebaseConfig';
import firebase from 'firebase/compat/app';
import { useChatStore } from "../../../lib/chatStore";

const ChatListClientMessenger = () => {
    const [chats, setChats] = useState([]);
    const [addMode, setAddMode] = useState(false);
    const { currentUser } = useUserStore();
    const { chatId, changeChat } = useChatStore();

    useEffect(() => {
      const fetchChats = async () => {
          const userChatsRef = firestore.collection("userchats").doc(currentUser.uid);
  
          const unSub = userChatsRef.onSnapshot(async (res) => {
              const items = res.data()?.chats || [];
  
              // Filter duplicate chatId entries
              const uniqueChats = items.reduce((acc, chat) => {
                  if (!acc.find(c => c.chatId === chat.chatId)) {
                      acc.push(chat);
                  }
                  return acc;
              }, []);
  
              const promises = uniqueChats.map(async (item) => {
                  // Fetch user details and attach
                  let userDocRef, userDocSnap, user;
  
                  userDocRef = firestore.collection("ServiceSeekers Users").doc(item.receiverId);
                  userDocSnap = await userDocRef.get();
                  if (!userDocSnap.exists) {
                      userDocRef = firestore.collection("Garage Users").doc(item.receiverId);
                      userDocSnap = await userDocRef.get();
                  }
  
                  user = userDocSnap.exists
                      ? userDocSnap.data()
                      : { first_name: "Unknown", last_name: "User" };
  
                  return { ...item, user };
              });
  
              const chatData = await Promise.all(promises);
              setChats(chatData.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updatedAt - a.updatedAt));
          });
  
          return () => unSub();
      };
  
      fetchChats();
  }, [currentUser.uid]);
  

    const handleSelect = async (chat) => {
        try {
            const userChatsRef = firestore.collection("userchats").doc(currentUser.uid);
            const chatIndex = chats.findIndex((item) => item.chatId === chat.chatId);

            if (chatIndex !== -1) {
                const updatedChats = [...chats];
                updatedChats[chatIndex].isSeen = true;
  
                const sanitizedChats = updatedChats.map(chat =>
                    Object.fromEntries(Object.entries(chat).filter(([_, v]) => v !== undefined))
                );

                await userChatsRef.update({
                    chats: sanitizedChats,
                });

                changeChat(chat.chatId); 
            }
        } catch (err) {
            console.log("Error updating chats:", err);
        }
    };

    const handleDelete = async (chatIdToDelete) => {
        try {
            const userChatsRef = firestore.collection("userchats").doc(currentUser.uid);
  
            
            const updatedChats = chats
                .filter((chat) => chat.chatId !== chatIdToDelete)
                .map(chat => {
                    return Object.fromEntries(
                        Object.entries(chat).filter(([_, value]) => value !== undefined)
                    );
                });

         
            await userChatsRef.update({
                chats: updatedChats
            });
  
            
            const chatRef = firestore.collection("chats").doc(chatIdToDelete);
            await chatRef.delete(); 

            setChats(updatedChats);
  
            
            if (chatId === chatIdToDelete) {
                handleCloseChat();
            }
        } catch (err) {
            console.error("Error deleting chat:", err);
        }
    };

    const handlePin = async (chatIdToPin) => {
        try {
            const userChatsRef = firestore.collection("userchats").doc(currentUser.uid);
            const chatIndex = chats.findIndex((item) => item.chatId === chatIdToPin);

            if (chatIndex !== -1) {
                const updatedChats = [...chats];
                const isPinned = updatedChats[chatIndex].pinned || false; 
                updatedChats[chatIndex].pinned = !isPinned;

                const sanitizedChats = updatedChats.map(chat =>
                    Object.fromEntries(Object.entries(chat).filter(([_, v]) => v !== undefined))
                );

                await userChatsRef.update({
                    chats: sanitizedChats,
                });

                setChats(updatedChats.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updatedAt - a.updatedAt));
            }
        } catch (err) {
            console.log("Error updating pinned status:", err);
        }
    };

    const handleCloseChat = () => {
        changeChat(null); 
    };

    return (
        <div className={styles.ClientMessengerChatlistContainer}>
            <div className={styles.Chatlistsearch}>
                <button
                    alt="Add User"
                    className={styles.ChatlistaddUserButton}
                    onClick={() => setAddMode((prev) => !prev)}
                >
                    {addMode ? "Close" : "Create Chat"}
                </button>

                {chatId && (
                    <button onClick={handleCloseChat} className={styles.ClientMessengerChatlistCloseChatButton}>
                        Close current chat
                    </button>
                )}
            </div>

            <div className={styles.ChatlistContent}>
                {chats.map((chat) => (
                    <div
                    className={`${styles.Chatlistitem} ${!chat.isSeen ? styles.unseenChat : ""}`}
                    key={chat.chatId}
                    onClick={() => handleSelect(chat)}
                >
                        <div className={styles.ChatlistPfpandname}>
                            <img
                                src={chat.user?.blocked?.includes(currentUser.uid)
                                    ? "./avatar.png"
                                    : chat.user?.profileImageUrl || "./avatar.png"
                                }
                                alt="User Avatar"
                            />
                            <div className={styles.Chatlisttexts}>
    <div className={styles.ChatlistNameAndPin}>
    <span className={styles.ChatlistName}>
    {chat.user?.blocked?.includes(currentUser.uid)
        ? "garage_name"
        : chat.user?.garage_name || `${chat.user?.first_name || ''} ${chat.user?.last_name || ''}`.trim() || "Unknown User"}
</span>

        
        <img
            src={chat.pinned ? '/icon/pinChatActive.png' : '/icon/pinChat.png'}
            alt="Pin Chat Icon"
            onClick={(e) => {
                e.stopPropagation();
                handlePin(chat.chatId);
            }}
            className={styles.ChatListPin}
        />
        {!chat.isSeen && <span className={styles.SeenDot}></span>}
    </div>
    <p>
    {chat.lastMessage ? (
        /https:\/\/firebasestorage\.googleapis\.com/.test(chat.lastMessage)
            ? "sent an image"
            : chat.lastMessage
    ) : (
        ""
    )}
</p>

</div>

                        </div>
                        
                        <img
                            src="/icon/Trash 2.png"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(chat.chatId);
                            }}
                            className={styles.ChatListDeleteIcon}
                        />
                    </div>
                ))}
            </div>

            {addMode && <AddUser closeAddUser={() => setAddMode(false)} />}
        </div>
    );
};

export default ChatListClientMessenger;
