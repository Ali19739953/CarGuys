import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import jsPDF from "jspdf";
import "./Preservicecontractbuilder.css";
import logoImage from "../../../public/logoImg.png";
import { updateBookingStatusInFirestore } from "../../Redux/Features/SharedSlices/Bookings/bookingSlice";
import { auth } from "../../firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { createNotification } from "../../Redux/Features/SharedSlices/Bookings/notificationSlice";

function Preservicecontractbuilder() {
  const { serviceId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bookingRequests = useSelector((state) => state.booking.bookingRequests);
  const serviceDetails = bookingRequests.find(service => service.id === serviceId);

  const [price, setPrice] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  if (!serviceDetails) {
    return <div>Loading... or Service not found</div>;
  }

  const handleDownload = async () => {
    if (!price || !deliveryDate) {
        alert("Please fill in both price and delivery date before generating the contract");
        return;
    }

    try {
        // Get current garage ID from auth
        const garageId = auth.currentUser?.uid;
        if (!garageId) {
            throw new Error('No garage ID found');
        }

        // Update booking status
        await dispatch(updateBookingStatusInFirestore({ 
            id: serviceId, 
            status: 'ongoing',
            price: price,
            deliveryDate: deliveryDate
        })).unwrap();

        // Generate PDF
        const doc = new jsPDF();
        doc.setFillColor(17, 17, 17);
        doc.rect(0, 0, doc.internal.pageSize.width, 35, 'F');
        doc.setFillColor(255, 165, 0);
        doc.setGState(new doc.GState({ opacity: 0.04 }));
        doc.rect(0, 0, doc.internal.pageSize.width, 35, 'F');
        doc.setGState(new doc.GState({ opacity: 1 }));
        const pageWidth = doc.internal.pageSize.width;
        const logoWidth = 90;
        const logoHeight= 25;
        const logoX = (pageWidth - logoWidth) / 2;
        doc.addImage(logoImage, 'PNG', logoX, 7, logoWidth, logoHeight);

        doc.setFontSize(22);
        doc.setFont("urbanist", "bold");
        doc.text("CarGuys Vehicle Service Contract", pageWidth/2, 50, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont("urbanist", "normal");
        doc.text(`Service ID: ${serviceId}`, pageWidth/2, 58, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont("urbanist", "bold");
        doc.text(`This Service Agreement ("Contract") is entered into on ${new Date().toLocaleDateString()}, by and between:`, 15, 65);
        
        doc.setFontSize(14);
        doc.setFont("urbanist", "bold");
        doc.text("Service Seeker (Customer):", 15, 80);
        doc.setFont("urbanist", "normal");
        doc.text(`${serviceDetails.first_name} ${serviceDetails.last_name}`, 15, 90);
        
        doc.setFont("urbanist", "bold");
        doc.text("Garage (Service Provider):", 15, 105);
        doc.setFont("urbanist", "normal");
        doc.text(`${serviceDetails.garageName}`, 15, 115);
        
        doc.setFontSize(14);
        doc.setFont("urbanist", "bold");
        doc.text("1. Scope of Services", 15, 130);
        doc.setFont("urbanist", "normal");
        doc.text("The Garage agrees to perform the following services:", 15, 140);
        doc.text(`Selected Services: ${serviceDetails.selectedServices?.join(', ')}`, 20, 150);
        
        doc.text("Vehicle Details:", 15, 165);
        doc.text(`Make: ${serviceDetails.selectedVehicle?.make}`, 20, 175);
        doc.text(`Model: ${serviceDetails.selectedVehicle?.model}`, 20, 185);
        doc.text(`Plate Number: ${serviceDetails.selectedVehicle?.numberPlate}`, 20, 195);
        
        doc.setFontSize(14);
        doc.setFont("urbanist", "bold");
        doc.text("2. Payment Terms", 15, 215);
        doc.setFontSize(12);
        doc.setFont("urbanist", "normal");
        doc.text(`The Service Seeker agrees to pay the amount of AED ${price}`, 15, 225);
        doc.text("Payment will be processed through the CarGuys platform upon completion of services.", 15, 235);
        
        doc.setFontSize(14);
        doc.setFont("urbanist", "bold");
        doc.text("3. Service Completion and Delivery", 15, 255);
        doc.setFontSize(12);
        doc.setFont("urbanist", "normal");
        doc.text(`The Garage agrees to complete the services by ${deliveryDate}`, 15, 265);
        
        doc.setFontSize(14);
        doc.setFont("urbanist", "bold");
        doc.text("4. Warranty and Liability", 15, 285);
        doc.setFontSize(12);
        doc.setFont("urbanist", "normal");
        doc.text("The Garage provides a warranty of 10 days for the completed services from the date of completion.", 15, 295);
        doc.text("covering any defects or issues directly related to the service provided.", 15, 305);
        
        doc.addPage();
        
        doc.setFontSize(14);
        doc.setFont("urbanist", "bold");
        doc.text("Signatures", 15, 30);
        
        doc.setFontSize(12);
        doc.setFont("urbanist", "normal");
        doc.text("Service Seeker (Customer)", 15, 50);
        doc.text(`Name: ${serviceDetails.first_name} ${serviceDetails.last_name}`, 15, 60);
        doc.line(15, 80, 100, 80); // Signature line
        
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 90);
        
        doc.text("Garage (Service Provider)", 15, 110);
        doc.text(`Name: ${serviceDetails.garageName}`, 15, 120);
        doc.line(15, 140, 100, 140); // Signature line
       
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 150);

        // Create blob and upload to Firebase Storage
        const pdfBlob = doc.output('blob');
        const storage = getStorage();
        const pdfRef = ref(
          storage, 
          `GarageDetails/${garageId}/serviceContracts/${serviceId}_${new Date().toISOString()}_contract.pdf`
        );
        
        await uploadBytes(pdfRef, pdfBlob);
        const pdfUrl = await getDownloadURL(pdfRef);

        // Create notification for service seeker
        await dispatch(createNotification({
          recipientId: serviceDetails.userId,
          type: 'CONTRACT_GENERATED',
          message: `A service contract has been generated for your vehicle (${serviceDetails.selectedVehicle?.make} ${serviceDetails.selectedVehicle?.model}). Quoted price: AED ${price}`,
          additionalData: {
            bookingId: serviceId,
            vehicleInfo: serviceDetails.selectedVehicle,
            generationDate: new Date().toISOString(),
            services: serviceDetails.selectedServices,
            price: price,
            deliveryDate: deliveryDate,
            contractUrl: pdfUrl,
            garageId: garageId
          }
        })).unwrap();

        // Only download PDF if current user is the garage
        if (auth.currentUser?.uid === garageId) {
            doc.save(`CarGuys_Service_Agreement_${serviceId}.pdf`);
        }

        navigate('/ManageOngoingservice');
        
    } catch (error) {
        console.error('Failed to process contract:', error);
        alert('There was an error processing the contract. Please try again.');
    }
  };

  return (
    <div className="preservice-container">
      <h1 className="preservice-title">Service Contract Details</h1>
      
      <div className="preservice-content">
        <div className="preservice-left-column">
          <div className="preservice-section">
            <h2 className="preservice-section__title">User Details</h2>
            <div className="preservice-section__info">
              <span className="preservice-section__info-label">Service ID:</span>
              <span>{serviceId}</span>
            </div>
            <div className="preservice-section__info">
              <span className="preservice-section__info-label">Customer Name:</span>
              <span>{serviceDetails.first_name} {serviceDetails.last_name}</span>
            </div>
            <div className="preservice-section__info">
              <span className="preservice-section__info-label">Payment Method:</span>
              <span>{serviceDetails.selectedPayment}</span>
            </div>
          </div>

          <div className="preservice-section preservice-section--card">
            <h2 className="preservice-section__title">Vehicle Information</h2>
            <img 
              className="preservice-section__vehicle-image"
              src={serviceDetails.selectedVehicle?.imageUrl || "/default-vehicle-image.png"} 
              alt="Vehicle" 
            />
            <div className="preservice-section__info">
              <span className="preservice-section__info-label">Make:</span>
              <span>{serviceDetails.selectedVehicle?.make}</span>
            </div>
            <div className="preservice-section__info">
              <span className="preservice-section__info-label">Model:</span>
              <span>{serviceDetails.selectedVehicle?.model}</span>
            </div>
            <div className="preservice-section__info">
              <span className="preservice-section__info-label">Plate Number:</span>
              <span>{serviceDetails.selectedVehicle?.numberPlate}</span>
            </div>
          </div>
        </div>

        <div className="preservice-right-column">
          <h2 className="preservice-section__title">Service Contract Details</h2>
          <div className="preservice-section__info">
            <span className="preservice-section__info-label">Requested Services:</span>
            <span>{serviceDetails.selectedServices?.join(', ')}</span>
          </div>
          
          <div className="preservice-form__group">
            <label className="preservice-form__label">
              Service Price (AED)
              <input 
                className="preservice-form__input"
                type="number" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter total price" 
              />
            </label>
          </div>

          <div className="preservice-form__group">
            <label className="preservice-form__label">
              Estimated Completion Date
              <input 
                className="preservice-form__input date-input"
                type="date" 
                value={deliveryDate} 
                onChange={(e) => setDeliveryDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                min={new Date().toISOString().split('T')[0]} // Prevents selecting past dates
              />
            </label>
          </div>
          
          <button 
            className="preservice-form__button" 
            onClick={handleDownload}
          >
            Generate and Download Service Contract
          </button>
        </div>
      </div>
    </div>
  );
}

export default Preservicecontractbuilder;
