from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from app.database import SessionLocal
from app.models import Usuario
from app.utils.firebase_auth import verify_token

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # 🟢 Rutas públicas del visor
        rutas_publicas = [
            "/api/proyectos/publicos",
            "/api/parques/publicos",
            "/api/ciclovias/publicos",
            "/api/comunas",
            "/api/categorias",
            "/api/estado-avance",
        ]

        if any(path.startswith(ruta) for ruta in rutas_publicas):
            return await call_next(request)

        # 🔒 Para panel admin u otras rutas privadas
        auth_header = request.headers.get("Authorization")

        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                decoded_token = verify_token(token)
                firebase_uid = decoded_token.get("uid")

                with SessionLocal() as db:
                    user = db.query(Usuario).filter(Usuario.firebase_uid == firebase_uid).first()

                if user:
                    request.state.user = {
                        "usuario_id": user.id,
                        "rol": user.rol,
                        "uid": user.firebase_uid,
                        "nombre_usuario": user.nombre_usuario
                    }
                else:
                    request.state.user = None
            except Exception as e:
                print("⚠️ Middleware: error verificando token:", str(e))
                request.state.user = None
        else:
            request.state.user = None

        return await call_next(request)
