import os
import json
import firebase_admin
from firebase_admin import credentials, initialize_app, auth

# Inicialización
if not firebase_admin._apps:
    config_str = os.getenv("FIREBASE_CONFIG_JSON")
    if not config_str:
        raise ValueError("❌ Variable FIREBASE_CONFIG_JSON no encontrada")

    firebase_config = json.loads(config_str)
    firebase_config["private_key"] = firebase_config["private_key"].replace("\\n", "\n")
    cred = credentials.Certificate(firebase_config)
    initialize_app(cred)

# Verificación del token
def verify_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise Exception(f"Token inválido: {str(e)}")
