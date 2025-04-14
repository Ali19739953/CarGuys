import { useState, useEffect } from "react";
  import styles from "./loginClient.module.css";
  import { toast } from "react-toastify";
  import { auth } from '@/firebaseConfig';
  
  const LoginClient = () => {
   
  
    useEffect(() => {
     
  
      
      const user = auth.currentUser;
  
      if (user) {
       
        toast.success(`Welcome back, ${user.email}!`);
        
      } else {
        
        toast.error("No user is currently logged in.");
      }
  
      
    }, []);
  
   
  };
  
  export default LoginClient;