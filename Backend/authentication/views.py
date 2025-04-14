from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json
from django.http import JsonResponse # a common JSON data format for sending and receiving data over a network.
from django.views.decorators.csrf import csrf_exempt
from firebase_admin import firestore, auth, exceptions
import json
from django.middleware.csrf import get_token
import logging
from django.core.mail import send_mail, EmailMessage

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


#Initializing firebase database
db = firestore.client()


# Function:  Garage Signup
@csrf_exempt
def garage_signup(request):
    if request.method == 'POST':
        try:
            # Get JSON data from the frontend
            data = json.loads(request.body.decode('utf-8'))

            # Extract the form fields
            email = data.get('email')
            password = data.get('password')
            garage_name = data.get('garageName')
            garage_phonenumber = data.get('garagephonenumber')
            garage_license = data.get('garagelicense')
            garage_location = data.get('garageLocation')
            user_type = data.get('UserType')
            #for rimageimage = data.get('image')

            # Create a new user in Firebase Authentication
            user = auth.create_user(
                email=email,
                password=password
            )

            #for rimageimage_url = blob.public_url 
            # Store the data in Firestore (Firebase)
            doc_ref = db.collection('Garage Users').document(user.uid)
            doc_ref.set({
                'uid' : user.uid,  
                'email': email,
                'password': password,  # For production, hash the password
                'garage_name': garage_name,
                'garage_phonenumber': garage_phonenumber,
                'garage_license': garage_license,
                'garage_location': garage_location,
                'user_type': user_type,
                #for rimage'image': image_url,
            })

             # Generate email verification link
            verification_link = auth.generate_email_verification_link(email)

            # Send the email verification link
            # send_mail(
            #     subject='Verify Your Email Address',
            #     message=f'Hello {garage_name},\n\nPlease verify your email address by clicking the following link:\n{verification_link}\n\nThank you!',
            #     from_email='noreply@yourdomain.com',  # Replace with your sender email
            #     recipient_list=[email],
            #     fail_silently=False,
            # )

            # Send the email verification link with HTML content and fallback
            email = EmailMessage(
                subject='Verify Your Email Address',
                body=f"""
                    <p>Welcome to CarGuys !</p>
                    <p>Hello {garage_name},</p>
                    <p>Please verify your email address by clicking the link below:</p>
                    <p><a href="{verification_link}" target="_blank">Verify Email Address</a></p>
                    <p>If the above link does not work, please copy and paste the following URL into your browser:</p>
                    <p>{verification_link}</p>
                    <p>Thank you!</p>
                """,
                from_email='carguyswebapplication@gmail.com',  
                to=[email],
            )
            email.content_subtype = 'html'  # Render email as HTML
            email.send()

            return JsonResponse({'message': 'Garage registered successfully', 'uid': user.uid}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    #same login for both interfaces

@csrf_exempt
def login(request):
    print("Login function called")  # Confirm the function is triggered
    if request.method == "POST":
        print("Handling POST request")  # Confirm it's handling a POST request
        try:
            data = json.loads(request.body)
            print("Request body parsed:", data)  # Log the incoming data
            id_token = data.get('idToken')
            
            if not id_token:
                print("ID token is missing in the request")
                return JsonResponse({'error': 'ID token is required'}, status=400)

            try:
                # Verify the token with extended options
                decoded_token = auth.verify_id_token(id_token, check_revoked=True)
                uid = decoded_token['uid']
                email = decoded_token.get('email') 

                print("Decoded token:", decoded_token)  # Log the decoded token
                if not email:
                    print("Email not found in token")
                    return JsonResponse({'error': 'Email not found in token'}, status=400)

                # Check in both collections
                seeker_ref = db.collection('ServiceSeekers Users').where('email', '==', email).limit(1).get()
                garage_ref = db.collection('Garage Users').where('email', '==', email).limit(1).get()

                if seeker_ref and len(seeker_ref) > 0:
                    user_data = seeker_ref[0].to_dict()
                    user_type = 'ServiceSeekers'
                elif garage_ref and len(garage_ref) > 0:
                    user_data = garage_ref[0].to_dict()
                    user_type = 'GarageManagers'
                else:
                    print(f"User with email {email} not found in database")
                    return JsonResponse({'error': 'User not found in database'}, status=404)

                print(f"User {email} logged in successfully as {user_type}")
                return JsonResponse({
                    'message': 'Login successful',
                    'user_id': uid,
                    'user_type': user_type,
                    'email': email,
                    'garage_name': user_data.get('garage_name'),
                    'first_name': user_data.get('first_name'),
                }, status=200)

            except auth.RevokedIdTokenError as e:
                print(f"Revoked ID token error: {str(e)}")
                return JsonResponse({'error': 'Your session has been revoked. Please log in again.'}, status=401)
            except auth.InvalidIdTokenError as e:
                print(f"Invalid ID token error: {str(e)}")
                return JsonResponse({'error': 'The provided ID token is invalid.'}, status=401)
            except auth.ExpiredIdTokenError as e:
                print(f"Expired ID token error: {str(e)}")
                return JsonResponse({'error': 'Your session has expired. Please log in again.'}, status=401)
            except auth.CertificateFetchError as e:
                print(f"Certificate fetch error: {str(e)}")
                return JsonResponse({'error': 'There was an error fetching token certificates. Please try again later.'}, status=500)

        except json.JSONDecodeError as e:
            print(f"JSON decode error: {str(e)}")
            return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return JsonResponse({'error': f'Unexpected error: {str(e)}'}, status=500)
    else:
        print("Invalid request method")
        return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def reset_password(request):
    if request.method == 'POST':
        try:
            # Parse the request body to get the email
            data = json.loads(request.body.decode('utf-8'))
            email = data.get('email')

            # Get data from firebase using the email
            user = auth.get_user_by_email(email)

            # log the user
            logger.info(f"User found: {user.email}")

            if not user:
                return JsonResponse({'error': 'User not found'}, status=400)

            if not email:
                return JsonResponse({'error': 'Email is required'}, status=400)

            try:
                # Generate the reset password link using Firebase Admin SDK
                reset_link = auth.generate_password_reset_link(email)

                # Send the reset password link via email
                email_message = EmailMessage(
                    subject='Reset Your Password',
                    body=f"""
                        <p>You requested a password reset. Click the link below to reset your password:</p>
                        <p><a href="{reset_link}" target="_blank">Reset Password</a></p>
                        <p>If the link does not work, copy and paste the following URL into your browser:</p>
                        <p>{reset_link}</p>
                        <p>If you did not request a password reset, please ignore this email.</p>
                        <p>Thank you!</p>
                    """,
                    from_email='noreply@yourdomain.com',  # Replace with your sender email
                    to=[email],
                )
                email_message.content_subtype = 'html'  # Render email as HTML
                email_message.send()

                return JsonResponse({'message': 'Password reset email sent successfully'}, status=200)
            except exceptions.FirebaseError as e:
                return JsonResponse({'error': str(e)}, status=400)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)

        except json.JSONDecodeError as e:
            return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def set_csrf(request):
    response = JsonResponse({"message": "CSRF cookie set"})
    response.set_cookie("csrftoken", get_token(request))
    return response
