from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.middleware.csrf import get_token
from firebase_admin import firestore, auth, exceptions
from django.core.mail import send_mail, EmailMessage
import json

# Initializing Firebase database
db = firestore.client()

@csrf_exempt
def seeker_signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            email = data.get('email')
            password = data.get('password')
            first_name = data.get('firstName')
            last_name = data.get('lastName')
            dob = data.get('dob')
            contact_number = data.get('contactNumber')
            location = data.get('location')
            user_type = data.get('UserType')

            # Create user in Firebase Authentication
            user = auth.create_user(
                email=email,
                password=password
            )

            # Prepare user data for Firestore
            user_data = {
                'uid': user.uid,
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'dob': dob,
                'contact_number': contact_number,
                'location': location,
                'user_type': user_type,
                'created_at': firestore.SERVER_TIMESTAMP
            }

            # Save user data in Firestore
            doc_ref = db.collection('ServiceSeekers Users').document(user.uid)
            doc_ref.set(user_data)

            # Verify that the Firestore document was created
            created_doc = doc_ref.get()
            if not created_doc.exists:
                raise Exception("Failed to create user document in Firestore")

            # Generate email verification link
            verification_link = auth.generate_email_verification_link(email)

            # Send the email verification link
            # send_mail(
            #     subject='Verify Your Email Address',
            #     message=f'Hello {first_name},\n\nPlease verify your email address by clicking the following link:\n{verification_link}\n\nThank you!',
            #     from_email='noreply@yourdomain.com',  # Replace with your sender email
            #     recipient_list=[email],
            #     fail_silently=False,
            # )

            # Send the email verification link with HTML content and fallback
            email = EmailMessage(
                subject='Verify Your Email Address',
                body=f"""
                    <p>Welcome to CarGuys !</p>
                    <p>Hello {first_name},</p>
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

            return JsonResponse({
                'message': 'Service seeker registered successfully. Please check your email for verification.',
                'uid': user.uid,
            }, status=200)
        except Exception as e:
            # If user creation succeeded but something else failed, delete the user
            if 'user' in locals():
                auth.delete_user(user.uid)
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)