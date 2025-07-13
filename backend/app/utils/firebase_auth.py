# app/utils/firebase_auth.py
import os
import json
import firebase_admin
from firebase_admin import credentials, auth

# 🔐 Leer clave de Firebase desde variable de entorno
firebase_key_json = os.getenv("FIREBASE_KEY_JSON")
if not firebase_key_json:
    raise ValueError("Falta la variable de entorno FIREBASE_KEY_JSON")

# 🔐 Convertir el string JSON a dict
firebase_creds = json.loads(firebase_key_json)

# 🔐 Inicializar Firebase si aún no está inicializado
if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_creds)
    firebase_admin.initialize_app(cred)

def verify_token(id_token: str):
    try:
        return auth.verify_id_token(id_token)
    except Exception as e:
        raise ValueError(f"Token inválido: {e}")
