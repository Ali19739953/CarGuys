import React, { useEffect, useState } from "react";
import { firestore, storage } from "../../firebaseConfig";
import { useSelector, useDispatch } from "react-redux";
import { selectUserInfo } from "../../Redux/Features/SharedSlices/Users/userSlice";
import { setSelectedVehicle } from "../../Redux/Features/SharedSlices/Vehicles/vehicleSlice";

function EditVehicle({ isOpen, onClose, onSave, vehicle = {} }) {
  const userInfo = useSelector(selectUserInfo);
  const dispatch = useDispatch();
  const [make, setMake] = useState(null);
  const [model, setModel] = useState(null);
  const [year, setYear] = useState(null);
  const [numberPlate, setNumberPlate] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (vehicle) {
      setMake(vehicle.make);
      setModel(vehicle.model);
      setYear(vehicle.year);
      setNumberPlate(vehicle.numberPlate);
      setImageUrl(vehicle.imageUrl);
    }
  }, [vehicle]);
  
  if (!isOpen) return null;
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!userInfo || !userInfo.user_id) {
      alert("User information is missing. Please log in again.");
      return;
    }

    try {
      let updatedImageUrl = imageUrl;

      if (imageFile) {
        const storageRef = storage.ref();
        const imageRef = storageRef.child(`ServiceSeeker/vehicles/${userInfo.user_id}/${vehicle.id}/${imageFile.name}`);
        await imageRef.put(imageFile);
        updatedImageUrl = await imageRef.getDownloadURL();
      }

      // Create updated vehicle data
      const updatedVehicleData = {
        make,
        model,
        year,
        numberPlate,
        imageUrl: updatedImageUrl,
      };

      // Update Vehicle Management collection
      await firestore
        .collection("Vehicle Management")
        .doc(userInfo.user_id)
        .collection("vehicles")
        .doc(vehicle.id)
        .update(updatedVehicleData);

      // Update BookingRequests collection
      const bookingRequestsSnapshot = await firestore
        .collection("BookingRequests")
        .where("userId", "==", userInfo.user_id)
        .where("selectedVehicle.id", "==", vehicle.id)
        .get();

      // Update Bookings collection
      const bookingsSnapshot = await firestore
        .collection("Bookings")
        .where("userId", "==", userInfo.user_id)
        .where("selectedVehicle.id", "==", vehicle.id)
        .get();

      const batch = firestore.batch();
      
      bookingRequestsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          "selectedVehicle.make": make,
          "selectedVehicle.model": model,
          "selectedVehicle.year": year,
          "selectedVehicle.numberPlate": numberPlate,
          "selectedVehicle.imageUrl": updatedImageUrl,
        });
      });

      bookingsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          "selectedVehicle.make": make,
          "selectedVehicle.model": model,
          "selectedVehicle.year": year,
          "selectedVehicle.numberPlate": numberPlate,
          "selectedVehicle.imageUrl": updatedImageUrl,
        });
      });

      await batch.commit();

      // Update Redux store with the new vehicle data
      dispatch(setSelectedVehicle({
        ...vehicle,
        ...updatedVehicleData
      }));

      onSave();
      alert("Vehicle details saved successfully!");
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert("Failed to update vehicle. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!userInfo || !userInfo.user_id) {
      alert("User information is missing. Please log in again.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await firestore
          .collection("Vehicle Management")
          .doc(userInfo.user_id)
          .collection("vehicles")
          .doc(vehicle.id)
          .delete();
        if (imageUrl) {
          const imageRef = storage.refFromURL(imageUrl);
          await imageRef.delete();
        }

        onClose();
        alert("Vehicle deleted successfully!");
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        alert("Failed to delete vehicle. Please try again.");
      }
    }
  };

  return (
    <div className="modal-overlay">
    <div className="edit-modal-container">
      <div className="edit-modal-content">
        <div className="edit-form-section">
          <div className="edit-form-row">
            <label className="edit-form-label">Make: </label>
            <input
              type="text"
              name="make"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              placeholder="Make"
              className="edit-form-input"
              required
            />
          </div>
          <div className="edit-form-row">
            <label className="edit-form-label">Model: </label>
            <input
              type="text"
              name="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Model"
              className="edit-form-input"
              required
            />
          </div>
          <div className="edit-form-row">
            <label className="edit-form-label">Year: </label>
            <input
              type="text"
              name="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Year"
              className="edit-form-input"
              required
            />
          </div>
         
          <div className="edit-form-row">
            <label className="edit-form-label">Plate: </label>
            <input
              type="text"
              name="Number Plate"
              value={numberPlate}
              onChange={(e) => setNumberPlate(e.target.value)}
              placeholder="Number Plate"
              className="edit-form-input"
              required
            />
          </div>
        </div>
        <div className="edit-image-section">
          {imagePreview || imageUrl ? (
            <img
              src={imagePreview || imageUrl}
              alt="Preview"
              className="preview-image"
            />
          ) : (
            <div className="upload-placeholder">Click to upload image</div>
          )}
          <button
            type="button"
            className="upload-button"
            onClick={() => document.getElementById("image-upload").click()}
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
      <div className="card-actions">
        <button
          type="button"
          className="edit-button"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          type="button"
          className="delete-button"
          onClick={()=>{
            onClose();
            setMake(null);
            setModel(null);
            setYear(null);
            setNumberPlate(null);
            setImageUrl(null);
            setImageFile(null);
            setImagePreview(null);
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          className="delete-button"
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
  );
}

export default EditVehicle;