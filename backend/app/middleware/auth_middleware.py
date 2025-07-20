from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from app.database import SessionLocal
from app.models import Usuario
from app.utils.firebase_auth import verify_token

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        auth_header = request.headers.get("Authorization")

        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                decoded_token = verify_token(token)
                firebase_uid = decoded_token.get("uid")

                db = SessionLocal()
                user = db.query(Usuario).filter(Usuario.firebase_uid == firebase_uid).first()
                db.close()

                if user:
                    request.state.user = {
                        "usuario_id": user.id,
                        "rol": user.rol,
                        "uid": user.firebase_uid,
                        "nombre_usuario": user.nombre_usuario
                    }

            except Exception as e:
                print("⚠️ Middleware: error verificando token:", str(e))
                request.state.user = None
        else:
            request.state.user = None

        return await call_next(request)
