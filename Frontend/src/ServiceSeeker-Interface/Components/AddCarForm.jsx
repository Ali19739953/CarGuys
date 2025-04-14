import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectUserInfo } from "../../Redux/Features/SharedSlices/Users/userSlice";
import { firestore, storage } from "../../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";

const AddCarForm = () => {
  const [carDetails, setCarDetails] = useState({
    make: "",
    model: "",
    year: "",
    numberPlate: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const userInfo = useSelector(selectUserInfo);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "year") {
      const year = value.split("-")[0];
      console.log(year);

      setCarDetails((prev) => ({
        ...prev,
        [name]: year,
      }));
    } else {
      setCarDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!carDetails.make || !carDetails.model || !carDetails.year || !carDetails.numberPlate) {
      alert("Please fill out all fields.");
      return;
    }
    if (!carDetails.image) {
      alert("Please upload an image.");
      return;
    }
    if (!userInfo || !userInfo.user_id) {
      alert("User information is missing. Please log in again.");
      return;
    }

    const vehicleId = uuidv4();

    try {
      const imageRef = ref(storage, `ServiceSeeker/vehicles/${userInfo.user_id}/${vehicleId}/${carDetails.image.name}`);
      await uploadBytes(imageRef, carDetails.image);
      const imageUrl = await getDownloadURL(imageRef);

      // Add a new document to the vehicles subcollection
      await firestore.collection("Vehicle Management").doc(userInfo.user_id).collection("vehicles").add({
        userId: userInfo.user_id,
        make: carDetails.make,
        model: carDetails.model,
        year: carDetails.year,
        numberPlate: carDetails.numberPlate,
        vehicleId: vehicleId,
        imageUrl: imageUrl,
      });

      alert("Vehicle added successfully!");
      navigate('/CarManagement');
    } catch (error) {
      console.error("Error adding vehicle: ", error);
      alert("Failed to add vehicle. Please try again.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setCarDetails((prev) => ({
          ...prev,
          image: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="add-vehicle-form-container">
    <p className="add-vehicle-form-title">Add Car Details</p>
    <form onSubmit={handleSubmit} className="add-vehicle-form">
      <div className="form-content">
        <div className="input-section">
          <div className="input-row">
            <input
              type="text"
              name="make"
              value={carDetails.make}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter Make..."
              required
            />
          </div>
          <div className="input-row">
            <input
              type="text"
              name="model"
              value={carDetails.model}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter Model..."
              required
            />
          </div>
          <div className="input-row">
            <input
              type="month"
              name="year"
              value={carDetails.year ? `${carDetails.year}-01` : ""}
              onChange={handleChange}
              className="input-field"
              placeholder="Add Year..."
              required
            />
          </div>
          <div className="input-row">
            <input
              type="text"
              name="numberPlate"
              value={carDetails.numberPlate}
              onChange={handleChange}
              className="input-field"
              placeholder="Add Number Plate..."
              required
            />
          </div>
        </div>

        <div className="image-upload-section">
          <div className="image-preview-container">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="preview-image"
              />
            )}
            <button
              type="button"
              className="upload-button"
              onClick={() =>
                document.getElementById("image-upload").click()
              }
            >
              <img src="/icon/Pluscircle.png" alt="Upload" />
            </button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="save-button">
          Save
        </button>
        <button
          type="button"
          className="cancel-button"
          onClick={() => navigate("/CarManagement")}
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
  );
};

export default AddCarForm;