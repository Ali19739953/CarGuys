import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from '@/firebaseConfig';

const upload = async (file) => {
  const timestamp = Date.now();
  const randomHash = Math.random().toString(36).substring(2, 8); 
  const uniqueFilename = `${timestamp}_${randomHash}_${file.name}`; 
  const storageRef = ref(storage, `chatMedia/${uniqueFilename}`);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        console.log(snapshot)
      },
      (error) => {
        console.error("Upload error:", error);
        reject("Something went wrong! " + error.code);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
};


export default upload;
