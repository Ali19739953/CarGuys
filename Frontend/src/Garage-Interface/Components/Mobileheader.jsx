import * as React from "react";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import { Link } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import RateReviewIcon from "@mui/icons-material/RateReview";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PaymentIcon from "@mui/icons-material/Payment";
import ChatIcon from "@mui/icons-material/Chat";
import ListAltIcon from "@mui/icons-material/ListAlt";
import GavelIcon from "@mui/icons-material/Gavel";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import MenuIcon from "@mui/icons-material/Menu";

function Mobileheader() {
  const actions = [
    { icon: <DashboardIcon />, name: "Dashboard", link: "/GarageDashboard" },
    {
      icon: <BuildIcon />,
      name: "Manage Garage Details",
      link: "/ManageGarageDetails",
    },
    {
      icon: <PeopleIcon />,
      name: "Client Management",
      link: "/CustomerManagement",
    },
    {
      icon: <AssignmentLateIcon />,
      name: "Incoming Requests",
      link: "/IncomingRequest",
    },
    {
      icon: <ListAltIcon />,
      name: "Ongoing Services",
      link: "/ManageOngoingservice",
    },
    {
      icon: <ListAltIcon />,
      name: "Pending Services",
      link: "/PendingServices",
    },
    {
      icon: <ListAltIcon />,
      name: "Completed Services",
      link: "/CompletedServices",
    },
    {
      icon: <GavelIcon />,
      name: "Service Contracts",
      link: "/ServiceContracts",
    },
    {
      icon: <RateReviewIcon />,
      name: "Client Reviews",
      link: "/ClientReviews",
    },
    { icon: <ChatIcon />, name: "Client Messenger", link: "/ClientMessenger" },
    { icon: <PaymentIcon />, name: "Payment History", link: "/PaymentHistory" },
  ];

  return (
    <Box sx={{ height: "100%", transform: "translateZ(0px)", flexGrow: 2 }}>
      <SpeedDial
        ariaLabel="SpeedDial basic example"
        sx={{
          position: "relative",
          top: 16,
        }}
        icon={
          <SpeedDialIcon
            icon={<MenuIcon  />}
            sx={{ color: "#000000"}} // Apply the color here
          />
        }
        direction="down" // Change direction to "down"
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={React.cloneElement(action.icon, { sx: { color: "#000000" } })}
            tooltipTitle={action.name}
            component={Link}
            to={action.link}
          />
        ))}
      </SpeedDial>
    </Box>
  );
}

export default Mobileheader;
