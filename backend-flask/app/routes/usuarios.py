from flask import Blueprint, request, jsonify
from app.service.usuario_service import UsuarioService

usuarios_bp = Blueprint('usuarios', __name__, url_prefix='/api/usuarios')

@usuarios_bp.route('/', methods=['POST'])
def criar_usuario():
    """
    Cria um novo usuário
    ---
    tags:
      - Usuários
    parameters:
      - in: body
        name: usuario
        description: Dados do usuário
        schema:
          type: object
          required:
            - nome
            - email
            - senha
          properties:
            nome:
              type: string
              example: "João Silva"
            email:
              type: string
              example: "joao@email.com"
            telefone:
              type: string
              example: "(11) 99999-9999"
            senha:
              type: string
              example: "123456"
            role:
              type: string
              enum: [client, attendant, manager]
              example: "client"
            is_admin:
              type: boolean
              example: false
    responses:
      201:
        description: Usuário criado com sucesso
      400:
        description: Dados inválidos
    """
    try:
        dados = request.get_json()

        if not dados:
            return jsonify({'erro': 'Dados não fornecidos'}), 400

        usuario = UsuarioService.criar_usuario(dados)

        return jsonify({
            'mensagem': 'Usuário criado com sucesso',
            'usuario': usuario
        }), 201

    except ValueError as e:
        return jsonify({'erro': str(e)}), 400
    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@usuarios_bp.route('/', methods=['GET'])
def listar_usuarios():
    """
    Lista todos os usuários
    ---
    tags:
      - Usuários
    responses:
      200:
        description: Lista de usuários
        schema:
          type: object
          properties:
            usuarios:
              type: array
              items:
                type: object
            total:
              type: integer
    """
    try:
        resultado = UsuarioService.listar_usuarios()
        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@usuarios_bp.route('/<int:usuario_id>', methods=['GET'])
def obter_usuario(usuario_id):
    """
    Obtém um usuário específico
    ---
    tags:
      - Usuários
    parameters:
      - name: usuario_id
        in: path
        type: integer
        required: true
        description: ID do usuário
    responses:
      200:
        description: Dados do usuário
      404:
        description: Usuário não encontrado
    """
    try:
        usuario = UsuarioService.buscar_usuario_por_id(usuario_id)
        return jsonify({'usuario': usuario}), 200

    except ValueError as e:
        return jsonify({'erro': str(e)}), 404
    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@usuarios_bp.route('/<int:usuario_id>', methods=['PUT'])
def atualizar_usuario(usuario_id):
    """
    Atualiza dados de um usuário
    ---
    tags:
      - Usuários
    parameters:
      - name: usuario_id
        in: path
        type: integer
        required: true
      - in: body
        name: usuario
        schema:
          type: object
          properties:
            nome:
              type: string
            email:
              type: string
            telefone:
              type: string
            role:
              type: string
              enum: [client, attendant, manager]
            is_admin:
              type: boolean
    responses:
      200:
        description: Usuário atualizado
      400:
        description: Dados inválidos
      404:
        description: Usuário não encontrado
    """
    try:
        dados = request.get_json()

        if not dados:
            return jsonify({'erro': 'Dados não fornecidos'}), 400

        usuario = UsuarioService.atualizar_usuario(usuario_id, dados)

        return jsonify({
            'mensagem': 'Usuário atualizado com sucesso',
            'usuario': usuario
        }), 200

    except ValueError as e:
        return jsonify({'erro': str(e)}), 400
    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@usuarios_bp.route('/<int:usuario_id>', methods=['DELETE'])
def deletar_usuario(usuario_id):
    """
    Remove um usuário
    ---
    tags:
      - Usuários
    parameters:
      - name: usuario_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Usuário removido
      404:
        description: Usuário não encontrado
    """
    try:
        resultado = UsuarioService.deletar_usuario(usuario_id)
        return jsonify(resultado), 200

    except ValueError as e:
        return jsonify({'erro': str(e)}), 404
    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@usuarios_bp.route('/estatisticas', methods=['GET'])
def obter_estatisticas():
    """
    Obtém estatísticas dos usuários
    ---
    tags:
      - Usuários
    responses:
      200:
        description: Estatísticas dos usuários
    """
    try:
        estatisticas = UsuarioService.obter_estatisticas()
        return jsonify(estatisticas), 200

    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500
