from flask import Blueprint, request, jsonify
from app.service.usuario_service import UsuarioService
from app.utils.jwt_utils import generate_token, token_required


auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Realiza login do usuário
    ---
    tags:
      - Autenticação
    parameters:
      - in: body
        name: login
        description: Credenciais de login
        schema:
          type: object
          required:
            - email
            - senha
            - role
          properties:
            email:
              type: string
              example: "joao@email.com"
            senha:
              type: string
              example: "123456"
            role:
              type: string
              enum: [client, attendant, manager]
              example: "client"
    responses:
      200:
        description: Login realizado com sucesso
        schema:
          type: object
          properties:
            usuario:
              type: object
            token:
              type: string
      401:
        description: Credenciais inválidas
      400:
        description: Dados inválidos
    """
    try:
        dados = request.get_json()

        if not dados:
            return jsonify({'erro': 'Dados não fornecidos'}), 400

        email = dados.get('email')
        senha = dados.get('senha')
        role = dados.get('role')  # client, attendant, manager

        if not email or not senha:
            return jsonify({'erro': 'Email e senha são obrigatórios'}), 400

        if not role or role not in ['client', 'attendant', 'manager']:
            return jsonify({
                'erro': 'Role é obrigatório e deve ser: client, '
                        'attendant ou manager'
            }), 400

        # Validar credenciais considerando o role
        usuario = UsuarioService.validar_credenciais_por_role(email, senha, role)

        if not usuario:
            return jsonify({'erro': 'Email ou senha incorretos'}), 401

        # Gerar token JWT
        token = generate_token({
            'user_id': usuario['id'],
            'nome': usuario['nome'],
            'email': usuario['email'],
            'telefone': usuario['telefone'],
            'role': usuario['role'],
            'is_admin': usuario['is_admin']
        })

        return jsonify({
            'mensagem': 'Login realizado com sucesso',
            'usuario': {
                'id': usuario['id'],
                'nome': usuario['nome'],
                'email': usuario['email'],
                'telefone': usuario['telefone'],
                'role': usuario['role'],
                'is_admin': usuario['is_admin']
            },
            'token': token
        }), 200

    except Exception:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """
    Realiza logout do usuário
    ---
    tags:
      - Autenticação
    responses:
      200:
        description: Logout realizado com sucesso
    """
    try:
        # Em produção, invalidar token aqui
        return jsonify({'mensagem': 'Logout realizado com sucesso'}), 200

    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@auth_bp.route('/me', methods=['GET'])
@token_required
def obter_usuario_logado():
    """
    Obtém dados do usuário logado (requer autenticação)
    ---
    tags:
      - Autenticação
    responses:
      200:
        description: Dados do usuário
        schema:
          type: object
          properties:
            usuario:
              type: object
      401:
        description: Não autorizado
    """
    try:
        # Dados do usuário vêm do token JWT (já validados pelo decorator)
        user_data = request.user

        # Obter dados completos do usuário do banco
        usuario = UsuarioService.buscar_usuario_por_id(user_data['user_id'])

        if not usuario:
            return jsonify({'erro': 'Usuário não encontrado'}), 404

        return jsonify({
            'usuario': {
                'id': usuario['id'],
                'nome': usuario['nome'],
                'email': usuario['email'],
                'telefone': usuario['telefone'],
                'role': usuario['role'],
                'is_admin': usuario['is_admin']
            }
        }), 200

    except Exception:
        return jsonify({'erro': 'Erro interno do servidor'}), 500
