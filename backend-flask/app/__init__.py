from flask import Flask, request
import os
from app.models.db import init_db

def create_app():
    app = Flask(__name__)

    # Configurar CORS para permitir requisições do frontend
    @app.after_request
    def after_request(response):
        # Permitir qualquer origem localhost com portas comuns de desenvolvimento
        allowed_origins = [
            "http://localhost:3000",
            "http://localhost:8080",
            "http://localhost:5173",
            "http://localhost:5000",
            "http://localhost"
        ]

        origin = request.headers.get('Origin')
        if origin and any(origin.startswith(allowed) for allowed in allowed_origins):
            response.headers.add('Access-Control-Allow-Origin', origin)
        elif not origin:  # Para requisições sem Origin (como Postman)
            response.headers.add('Access-Control-Allow-Origin', '*')

        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    # Configurações do banco de dados
    # Usar caminho absoluto baseado na localização do arquivo
    app_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(app_dir, '..', 'database', 'db.sqlite3')
    schema_path = os.path.join(app_dir, '..', 'database', 'schema.sql')
    seed_path = os.path.join(app_dir, '..', 'database', 'seed.sql')

    app.config['DB_PATH'] = db_path

    # Inicializar banco de dados apenas com schema (sem dados iniciais automáticos)
    with app.app_context():
        init_db(db_path, schema_path)

    from .routes.init import init_bp
    from .routes.usuarios import usuarios_bp
    from .routes.auth import auth_bp
    from .routes.produtos import produtos_bp
    from .routes.categorias import categorias_bp
    from .routes.pedidos import pedidos_bp

    app.register_blueprint(init_bp)
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(produtos_bp)
    app.register_blueprint(categorias_bp)
    app.register_blueprint(pedidos_bp)

    return app