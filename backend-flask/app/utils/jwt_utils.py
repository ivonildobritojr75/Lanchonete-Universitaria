import jwt
import datetime
import os
from functools import wraps
from flask import request, jsonify

# Chave secreta para JWT (em produção, deve vir de variável de ambiente)
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'sua-chave-secreta-super-segura-aqui')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

def generate_token(user_data):
    """Gera um token JWT para o usuário"""
    payload = {
        'user_id': user_data['user_id'],
        'email': user_data['email'],
        'role': user_data['role'],
        'is_admin': user_data.get('is_admin', False),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.datetime.utcnow()
    }

    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token

def verify_token(token):
    """Verifica e decodifica um token JWT"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token expirado
    except jwt.InvalidTokenError:
        return None  # Token inválido

def get_token_from_request():
    """Extrai o token do header Authorization"""
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        return auth_header.split(' ')[1]
    return None

def token_required(f):
    """Decorator para proteger rotas que requerem autenticação"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_token_from_request()

        if not token:
            return jsonify({'erro': 'Token de acesso não fornecido'}), 401

        payload = verify_token(token)
        if not payload:
            return jsonify({'erro': 'Token inválido ou expirado'}), 401

        # Adicionar dados do usuário ao request
        request.user = payload
        return f(*args, **kwargs)

    return decorated_function

def admin_required(f):
    """Decorator para rotas que requerem privilégios de administrador"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_token_from_request()

        if not token:
            return jsonify({'erro': 'Token de acesso não fornecido'}), 401

        payload = verify_token(token)
        if not payload:
            return jsonify({'erro': 'Token inválido ou expirado'}), 401

        if not payload.get('is_admin', False):
            return jsonify({'erro': 'Acesso negado. Privilégios de administrador necessários'}), 403

        request.user = payload
        return f(*args, **kwargs)

    return decorated_function
