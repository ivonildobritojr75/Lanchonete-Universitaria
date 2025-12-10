from flask import Blueprint, request, jsonify
from app.service.produto_service import ProdutoService

produtos_bp = Blueprint('produtos', __name__, url_prefix='/api/produtos')

@produtos_bp.route('/', methods=['POST'])
def criar_produto():
    """
    Cria um novo produto
    ---
    tags:
      - Produtos
    consumes:
      - multipart/form-data
    parameters:
      - name: nome
        in: formData
        type: string
        required: true
        example: "Hamburger"
      - name: preco
        in: formData
        type: number
        required: true
        example: 15.99
      - name: categoria
        in: formData
        type: string
        required: true
        example: "Lanches"
      - name: disponivel
        in: formData
        type: boolean
        example: true
      - name: imagem
        in: formData
        type: file
        description: Arquivo de imagem do produto
      - name: descricao
        in: formData
        type: string
        example: "Delicioso hamburger com queijo e molho especial"
    responses:
      201:
        description: Produto criado com sucesso
      400:
        description: Dados inválidos
    """
    try:
        # Verificar se é multipart/form-data ou JSON
        if (request.content_type and
                'multipart/form-data' in request.content_type):
            # Processar dados do formulário
            dados = {}
            for key in request.form:
                dados[key] = request.form[key]

            # Converter valores apropriados
            if 'preco' in dados:
                dados['preco'] = float(dados['preco'])
            if 'disponivel' in dados:
                dados['disponivel'] = dados['disponivel'].lower() == 'true'

            # Processar arquivo de imagem
            if 'imagem' in request.files:
                arquivo_imagem = request.files['imagem']
                if arquivo_imagem and arquivo_imagem.filename:
                    # Salvar imagem e obter caminho
                    caminho_imagem = ProdutoService.salvar_imagem_produto(arquivo_imagem)
                    dados['imagem'] = caminho_imagem
                else:
                    # Usar emoji padrão se não houver imagem
                    dados['imagem'] = '🍽️'
            else:
                dados['imagem'] = '🍽️'
        else:
            # Processar dados JSON (compatibilidade com versão anterior)
            dados = request.get_json()
            if not dados:
                return jsonify({'erro': 'Dados não fornecidos'}), 400

        produto = ProdutoService.criar_produto(dados)

        return jsonify({
            'mensagem': 'Produto criado com sucesso',
            'produto': produto
        }), 201

    except ValueError as e:
        return jsonify({'erro': str(e)}), 400
    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@produtos_bp.route('/', methods=['GET'])
def listar_produtos():
    """
    Lista produtos com filtros opcionais
    ---
    tags:
      - Produtos
    parameters:
      - name: disponiveis_apenas
        in: query
        type: boolean
        description: Listar apenas produtos disponíveis
      - name: categoria
        in: query
        type: string
        description: Filtrar por categoria
      - name: busca
        in: query
        type: string
        description: Buscar por nome parcial
    responses:
      200:
        description: Lista de produtos
        schema:
          type: object
          properties:
            produtos:
              type: array
              items:
                type: object
            total:
              type: integer
    """
    try:
        disponiveis_apenas = (request.args.get('disponiveis_apenas', 'false')
                               .lower() == 'true')
        categoria = request.args.get('categoria')
        busca = request.args.get('busca')

        resultado = ProdutoService.listar_produtos(
            disponiveis_apenas=disponiveis_apenas,
            categoria=categoria,
            busca=busca
        )

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@produtos_bp.route('/<int:produto_id>', methods=['GET'])
def obter_produto(produto_id):
    """
    Obtém um produto específico
    ---
    tags:
      - Produtos
    parameters:
      - name: produto_id
        in: path
        type: integer
        required: true
        description: ID do produto
    responses:
      200:
        description: Dados do produto
      404:
        description: Produto não encontrado
    """
    try:
        produto = ProdutoService.buscar_produto_por_id(produto_id)
        return jsonify({'produto': produto}), 200

    except ValueError as e:
        return jsonify({'erro': str(e)}), 404
    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@produtos_bp.route('/<int:produto_id>', methods=['PUT'])
def atualizar_produto(produto_id):
    """
    Atualiza dados de um produto
    ---
    tags:
      - Produtos
    consumes:
      - multipart/form-data
    parameters:
      - name: produto_id
        in: path
        type: integer
        required: true
      - name: nome
        in: formData
        type: string
      - name: preco
        in: formData
        type: number
      - name: categoria
        in: formData
        type: string
      - name: disponivel
        in: formData
        type: boolean
      - name: imagem
        in: formData
        type: file
        description: Novo arquivo de imagem do produto
      - name: descricao
        in: formData
        type: string
    responses:
      200:
        description: Produto atualizado
      400:
        description: Dados inválidos
      404:
        description: Produto não encontrado
    """
    try:
        # Verificar se é multipart/form-data ou JSON
        if (request.content_type and
                'multipart/form-data' in request.content_type):
            # Processar dados do formulário
            dados = {}
            for key in request.form:
                dados[key] = request.form[key]

            # Converter valores apropriados
            if 'preco' in dados:
                dados['preco'] = float(dados['preco'])
            if 'disponivel' in dados:
                dados['disponivel'] = dados['disponivel'].lower() == 'true'

            # Processar arquivo de imagem
            if 'imagem' in request.files:
                arquivo_imagem = request.files['imagem']
                if arquivo_imagem and arquivo_imagem.filename:
                    # Salvar imagem e obter caminho
                    caminho_imagem = ProdutoService.salvar_imagem_produto(arquivo_imagem)
                    dados['imagem'] = caminho_imagem
                # Se não há arquivo, não alterar a imagem atual
        else:
            # Processar dados JSON (compatibilidade com versão anterior)
            dados = request.get_json()
            if not dados:
                return jsonify({'erro': 'Dados não fornecidos'}), 400

        produto = ProdutoService.atualizar_produto(produto_id, dados)

        return jsonify({
            'mensagem': 'Produto atualizado com sucesso',
            'produto': produto
        }), 200

    except ValueError as e:
        return jsonify({'erro': str(e)}), 400
    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@produtos_bp.route('/<int:produto_id>', methods=['DELETE'])
def deletar_produto(produto_id):
    """
    Remove um produto (soft delete por padrão, permanente opcional)
    ---
    tags:
      - Produtos
    parameters:
      - name: produto_id
        in: path
        type: integer
        required: true
      - name: permanente
        in: query
        type: boolean
        required: false
        description: Se true, remove permanentemente do banco.
                     Se false (padrão), marca como indisponível
    responses:
      200:
        description: Produto removido
      404:
        description: Produto não encontrado
    """
    try:
        permanente = request.args.get('permanente', 'false').lower() == 'true'
        resultado = ProdutoService.deletar_produto(produto_id,
                                                     permanente=permanente)
        return jsonify(resultado), 200

    except ValueError as e:
        return jsonify({'erro': str(e)}), 404
    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@produtos_bp.route('/estatisticas', methods=['GET'])
def obter_estatisticas_produtos():
    """
    Obtém estatísticas dos produtos
    ---
    tags:
      - Produtos
    responses:
      200:
        description: Estatísticas dos produtos
    """
    try:
        estatisticas = ProdutoService.obter_estatisticas()
        return jsonify(estatisticas), 200

    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@produtos_bp.route('/categorias', methods=['GET'])
def listar_categorias():
    """
    Lista todas as categorias disponíveis
    ---
    tags:
      - Produtos
    responses:
      200:
        description: Lista de categorias
    """
    try:
        resultado = ProdutoService.listar_categorias()
        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500
