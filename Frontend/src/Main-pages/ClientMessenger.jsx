import React, { useState, useEffect } from "react";
import "./ClientMessenger.css";
import Chat from "./Components/chat/Chat";
import List from "./Components/list/List";
import LoginClient from "./Components/login/LoginClient";
import { auth } from "@/firebaseConfig.jsx";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import GarageNavbar from "../../src/Garage-Interface/Components/GarageNavbar";
import NavBarSeeker from "../ServiceSeeker-Interface/Components/NavBarSeeker";
import { onAuthStateChanged } from "firebase/auth";
import Headericons from "../../src/Garage-Interface/Components/Headericons";

const ClientMessenger = () => {
    const { currentUser, isLoading, fetchUserInfo } = useUserStore();
    const { chatId } = useChatStore();
  
    useEffect(() => {
      const unSub = onAuthStateChanged(auth, (user) => {
        fetchUserInfo(user?.uid);
        console.log("User:", user);  
      });
    
      return () => {
        unSub();
      };
    }, [fetchUserInfo]);
    
    // console.log("Current User from Store:", currentUser);  
    // console.log("current user email -<", currentUser.email);
    // console.log("Current ueser type =>", currentUser.user_type);
    // console.log("current user type ->", auth.currentUser.user_type);
    
  
    if (isLoading) return <div className="loading">Loading...</div>;
  
    return (
      <div className="clientMessengerContainer">
       
        {currentUser ? (
      currentUser.user_type === "ServiceSeeker" ? <NavBarSeeker /> : <GarageNavbar />
    ) : (
      <div>Loading user data...</div> 
    )}
      
      <section className="clientMessengerMain">

      <header className="ClientMessengerHeader">
         
          <Headericons
            Title={"Client Messenger"}
            
          />
        </header>

        <section className="clientMessengerContent">
        {currentUser ? (
          <>
            <List />
            {chatId && <Chat /> }
           
          </>
        ) : (
          <LoginClient />
        )}
      
        </section>
        </section>
      </div>
    );
  };
  
  export default ClientMessenger;