# app/utils/firebase_auth.py
import os
import firebase_admin
from firebase_admin import credentials, auth

# Ruta al JSON con claves de Firebase
cred_path = os.path.join(os.path.dirname(__file__), "firebase_key.json")

# Inicializar solo si aún no está inicializado
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

def verify_token(id_token: str):
    try:
        return auth.verify_id_token(id_token)
    except Exception as e:
        raise ValueError(f"Token inválido: {e}")
