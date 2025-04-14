import * as React from "react";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import BuildIcon from "@mui/icons-material/Build";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import MenuIcon from "@mui/icons-material/Menu";

function NavBarMobile() {
  const actions = [
    { icon: <HomeIcon />, name: "Homepage", link: "/ServiceSeekerHomepage" },
    { icon: <SearchIcon />, name: "Browse Garages", link: "/BrowseGarage" },
    { icon: <BuildIcon />, name: "Service Status", link: "/ServiceStatus" },
    { icon: <DirectionsCarIcon />, name: "Car Management", link: "/CarManagement" },
  ];

  return (
    <Box sx={{ height: "100%", transform: "translateZ(0px)", flexGrow: 2 }}>
      <SpeedDial
        ariaLabel="Service Seeker Navigation"
        sx={{
          position: "relative",
          bottom: 16,
          top: 20,
          right: 0,
        }}
        icon={<SpeedDialIcon icon={<MenuIcon />} openIcon={<MenuIcon />} />}
        direction="down"
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

export default NavBarMobile;