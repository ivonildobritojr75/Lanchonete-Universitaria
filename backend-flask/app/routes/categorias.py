from flask import Blueprint, request, jsonify
from app.service.categoria_service import CategoriaService

categorias_bp = Blueprint('categorias', __name__, url_prefix='/api/categorias')

@categorias_bp.route('/', methods=['POST'])
def criar_categoria():
    """
    Cria uma nova categoria
    ---
    tags:
      - Categorias
    parameters:
      - in: body
        name: categoria
        description: Dados da categoria
        schema:
          type: object
          required:
            - nome
          properties:
            nome:
              type: string
              example: "Lanches"
            descricao:
              type: string
              example: "Pratos principais e sanduíches"
            ativo:
              type: boolean
              example: true
    responses:
      201:
        description: Categoria criada com sucesso
      400:
        description: Dados inválidos
    """
    try:
        dados = request.get_json()

        if not dados:
            return jsonify({'erro': 'Dados não fornecidos'}), 400

        categoria = CategoriaService.criar_categoria(dados)

        return jsonify({
            'mensagem': 'Categoria criada com sucesso',
            'categoria': categoria
        }), 201

    except ValueError as e:
        return jsonify({'erro': str(e)}), 400
    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@categorias_bp.route('/', methods=['GET'])
def listar_categorias():
    """
    Lista todas as categorias ativas
    ---
    tags:
      - Categorias
    responses:
      200:
        description: Lista de categorias
        schema:
          type: object
          properties:
            categorias:
              type: array
              items:
                type: object
            total:
              type: integer
    """
    try:
        resultado = CategoriaService.listar_categorias()
        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@categorias_bp.route('/<int:categoria_id>', methods=['GET'])
def obter_categoria(categoria_id):
    """
    Obtém uma categoria específica
    ---
    tags:
      - Categorias
    parameters:
      - name: categoria_id
        in: path
        type: integer
        required: true
        description: ID da categoria
    responses:
      200:
        description: Dados da categoria
      404:
        description: Categoria não encontrada
    """
    try:
        categoria = CategoriaService.buscar_categoria_por_id(categoria_id)
        return jsonify({'categoria': categoria}), 200

    except ValueError as e:
        return jsonify({'erro': str(e)}), 404
    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@categorias_bp.route('/<int:categoria_id>', methods=['PUT'])
def atualizar_categoria(categoria_id):
    """
    Atualiza dados de uma categoria
    ---
    tags:
      - Categorias
    parameters:
      - name: categoria_id
        in: path
        type: integer
        required: true
      - in: body
        name: categoria
        schema:
          type: object
          properties:
            nome:
              type: string
            descricao:
              type: string
            ativo:
              type: boolean
    responses:
      200:
        description: Categoria atualizada
      400:
        description: Dados inválidos
      404:
        description: Categoria não encontrada
    """
    try:
        dados = request.get_json()

        if not dados:
            return jsonify({'erro': 'Dados não fornecidos'}), 400

        categoria = CategoriaService.atualizar_categoria(categoria_id, dados)

        return jsonify({
            'mensagem': 'Categoria atualizada com sucesso',
            'categoria': categoria
        }), 200

    except ValueError as e:
        return jsonify({'erro': str(e)}), 400
    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@categorias_bp.route('/<int:categoria_id>', methods=['DELETE'])
def deletar_categoria(categoria_id):
    """
    Remove uma categoria
    ---
    tags:
      - Categorias
    parameters:
      - name: categoria_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Categoria removida
      404:
        description: Categoria não encontrada
    """
    try:
        resultado = CategoriaService.deletar_categoria(categoria_id)
        return jsonify(resultado), 200

    except ValueError as e:
        return jsonify({'erro': str(e)}), 404
    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@categorias_bp.route('/estatisticas', methods=['GET'])
def obter_estatisticas_categorias():
    """
    Obtém estatísticas das categorias
    ---
    tags:
      - Categorias
    responses:
      200:
        description: Estatísticas das categorias
    """
    try:
        estatisticas = CategoriaService.obter_estatisticas()
        return jsonify(estatisticas), 200

    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500
