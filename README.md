# CarGuys-Project



# Introduction

**The only one in all UAE**

**CarGuys** is a web application designed to connect users with garages, helping users find all garages in one place while assisting garages in increasing their customer base. The application offers features for both Service Seekers and Garage Managers.The system includes:

- Garage management interface
- Service seeker interface
- Real-time payment processing
- User authentication
- Email verification system
- Map integration for location services
- Analytics and reporting
- Notifications and messaging
- Responsive design for various devices
- Chatbot for customer support
- Animations and visual effects
- And more!

*** Technology Stack ***

*** Frontend ***
- React + Vite
- Material-UI
- Firebase Authentication
- Stripe Payment Integration
- Leaflet for maps
- GSAP for animations

**Backend**
- Django (Main Backend)
- Node.js (Payment Server)
- Firebase Admin SDK
- Stripe Payment Processing
- Email Service Integration


# Installation

1. Clone the repository:  
From Main Branch
    \`\`\`bash  
    git clone <https://your-bitbucket-repo-url.git>  
    \`\`\`
2. Navigate to the \`frontend\` directory and install dependencies:  
    \`\`\`bash  
    cd CarGuys-ccp/frontend  
    npm install  
    \`\`\`
3. Navigate to the \`backend\` directory and set up the Django environment:  
    \`\`\`bash  
    cd CarGuys-ccp/backend  
    <br/>\`\`\`

# Usage

1. Start the frontend server:  
    \`\`\`bash  
    cd CarGuys/frontend  
    npm run dev  
    \`\`\`
2. Start the backend server:  
    \`\`\`bash  
    cd CarGuys/backend  
    python manage.py runserver
3. Start Node Server

\`\`\`

# Folder-Structure

\`\`\`  
CarGuys/  
├── frontend/  
│ ├── src/  
│ ├── public/  
│ └── ...  
├── backend/  
│ ├── manage.py  
│ ├── app/  
│ └── ...  
└── README.md  
\`\`\`

**Authentication Endpoints**
- POST `/api/login/` - User login
- POST `/api/garage-signup/` - Garage registration
- POST `/api/signup/` - Service seeker registration

**Payment Endpoints**
- POST `/api/create-payment` - Initialize payment session
- POST `/webhook` - Stripe webhook handler

**Project Contributors**
This project was primarily developed by Mohammad Ali, who made significant contributions to the architecture, implementation, and overall development of the application. Additional team members have contributed to specific features and improvements.

**License and Copyright**
© 2024 Mohammad Ali and Contributors. All Rights Reserved.

**Copyright & License Notice**
© 2024 Mohammad Ali

⚠️ IMPORTANT: This repository is temporarily public and will be made private after some time.
During this public period, this code is viewable but protected under copyright law:

- No commercial use
- No redistribution
- No derivative works

All rights are reserved and will be fully enforced when this repository becomes private.
This applies to the code, documentation, and any other materials included in this repository. 
Applies on **team members** and **contributors**.

# Contact

For any inquiries, please reach out to [ali69571@gmail.com](mailto:ali69571@gmail.com) or [mdborhan8470@gmail.com](mailto:mdborhan8470@gmail.com).# Carguys
# Carguys
