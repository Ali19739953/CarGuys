# webBackend/loginAuthentication.py
#Token based authentication so there is no direct handling of passwords in the backend
# 

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from firebase_admin import auth

@csrf_exempt
def login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            id_token = data.get('idToken')  # Get the token from the frontend
            
            if not id_token:
                return JsonResponse({'error': 'ID token is required'}, status=400)

            # Verify the ID token against Firebase
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token['uid']
            
            # Optionally fetch additional user info from your database if needed
            
            return JsonResponse({'message': 'Login successful', 'user_id': uid}, status=200)

        except auth.AuthError:
            return JsonResponse({'error': 'Invalid token'}, status=401)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

