from flask import Blueprint, request, jsonify
from app.service.pedido_service import PedidoService
from app.utils.jwt_utils import token_required
from app.models.pedido import StatusPedido

pedidos_bp = Blueprint('pedidos', __name__, url_prefix='/api/pedidos')

@pedidos_bp.route('/', methods=['POST'])
@token_required
def criar_pedido():
    """
    Cria um novo pedido
    ---
    tags:
      - Pedidos
    security:
      - Bearer: []
    parameters:
      - in: body
        name: pedido
        description: Dados do pedido
        schema:
          type: object
          required:
            - itens_carrinho
          properties:
            itens_carrinho:
              type: array
              items:
                type: object
                properties:
                  produto_id:
                    type: integer
                  quantidade:
                    type: integer
            observacoes:
              type: string
    responses:
      201:
        description: Pedido criado com sucesso
      400:
        description: Dados inválidos
      401:
        description: Não autorizado
    """
    try:
        dados = request.get_json()

        if not dados:
            return jsonify({'erro': 'Dados não fornecidos'}), 400

        if not dados.get('itens_carrinho'):
            return jsonify({'erro': 'Itens do carrinho são obrigatórios'}), 400

        # Adicionar ID do usuário atual
        user_data = request.user
        dados['usuario_id'] = user_data['user_id']

        pedido = PedidoService.criar_pedido(dados, dados['itens_carrinho'])

        return jsonify({
            'mensagem': 'Pedido criado com sucesso',
            'pedido': pedido
        }), 201

    except ValueError as e:
        return jsonify({'erro': str(e)}), 400
    except Exception:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@pedidos_bp.route('/', methods=['GET'])
@token_required
def listar_pedidos():
    """
    Lista pedidos do usuário atual ou todos (para admin)
    ---
    tags:
      - Pedidos
    security:
      - Bearer: []
    parameters:
      - name: status
        in: query
        type: string
        description: Filtrar por status
      - name: limit
        in: query
        type: integer
        description: Limite de resultados
      - name: offset
        in: query
        type: integer
        description: Offset para paginação
    responses:
      200:
        description: Lista de pedidos
      401:
        description: Não autorizado
    """
    try:
        status = request.args.get('status')
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', 0, type=int)

        user_data = request.user
        # Admin/manager vê todos os pedidos, usuário comum vê apenas os seus
        if user_data['role'] in ['manager', 'attendant'] or user_data.get('is_admin', False):
            resultado = PedidoService.listar_todos_pedidos(status, limit, offset)
        else:
            resultado = PedidoService.listar_pedidos_usuario(user_data['user_id'], status)

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@pedidos_bp.route('/<int:pedido_id>', methods=['GET'])
@token_required
def obter_pedido(pedido_id):
    """
    Obtém um pedido específico
    ---
    tags:
      - Pedidos
    security:
      - Bearer: []
    parameters:
      - name: pedido_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Dados do pedido
      404:
        description: Pedido não encontrado
      401:
        description: Não autorizado
      403:
        description: Acesso negado
    """
    try:
        pedido = PedidoService.buscar_pedido_por_id(pedido_id)
        user_data = request.user

        # Verificar se o usuário pode ver este pedido
        if (user_data['role'] not in ['manager', 'attendant'] and
            not user_data.get('is_admin', False) and
            pedido['usuario_id'] != user_data['user_id']):
            return jsonify({'erro': 'Acesso negado'}), 403

        return jsonify({'pedido': pedido}), 200

    except ValueError as e:
        return jsonify({'erro': str(e)}), 404
    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@pedidos_bp.route('/<int:pedido_id>/status', methods=['PUT'])
@token_required
def atualizar_status_pedido(pedido_id):
    """
    Atualiza o status de um pedido
    ---
    tags:
      - Pedidos
    security:
      - Bearer: []
    parameters:
      - name: pedido_id
        in: path
        type: integer
        required: true
      - in: body
        name: status
        schema:
          type: object
          required:
            - status
          properties:
            status:
              type: string
              enum: [em_andamento, preparando, pronto, finalizado, cancelado]
    responses:
      200:
        description: Status atualizado
      400:
        description: Dados inválidos
      401:
        description: Não autorizado
      403:
        description: Acesso negado
      404:
        description: Pedido não encontrado
    """
    try:
        dados = request.get_json()
        user_data = request.user

        if not dados or not dados.get('status'):
            return jsonify({'erro': 'Status é obrigatório'}), 400

        novo_status = dados['status']

        # Verificar permissões: apenas admin/manager/attendant pode mudar status
        if user_data['role'] not in ['manager', 'attendant'] and not user_data.get('is_admin', False):
            return jsonify({'erro': 'Apenas funcionários podem alterar o status dos pedidos'}), 403

        # Criar objeto mock para manter compatibilidade com o serviço
        class MockUser:
            def __init__(self, user_data):
                self.id = user_data['user_id']
                self.role = user_data['role']
                self.is_admin = user_data.get('is_admin', False)

        mock_user = MockUser(user_data)
        pedido = PedidoService.atualizar_status_pedido(pedido_id, novo_status, mock_user)

        return jsonify({
            'mensagem': 'Status do pedido atualizado com sucesso',
            'pedido': pedido
        }), 200

    except ValueError as e:
        return jsonify({'erro': str(e)}), 400
    except Exception:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@pedidos_bp.route('/<int:pedido_id>/cancelar', methods=['PUT'])
@token_required
def cancelar_pedido(pedido_id):
    """
    Cancela um pedido
    ---
    tags:
      - Pedidos
    security:
      - Bearer: []
    parameters:
      - name: pedido_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Pedido cancelado
      400:
        description: Não é possível cancelar
      401:
        description: Não autorizado
      403:
        description: Acesso negado
      404:
        description: Pedido não encontrado
    """
    try:
        user_data = request.user
        pedido = PedidoService.cancelar_pedido(pedido_id, user_data['user_id'])

        return jsonify({
            'mensagem': 'Pedido cancelado com sucesso',
            'pedido': pedido
        }), 200

    except ValueError as e:
        return jsonify({'erro': str(e)}), 400
    except Exception:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@pedidos_bp.route('/<int:pedido_id>', methods=['DELETE'])
@token_required
def deletar_pedido(pedido_id):
    """
    Remove um pedido (apenas para admin)
    ---
    tags:
      - Pedidos
    security:
      - Bearer: []
    parameters:
      - name: pedido_id
        in: path
        type: integer
        required: true
      - name: permanente
        in: query
        type: boolean
        description: Se true, remove permanentemente
    responses:
      200:
        description: Pedido removido
      401:
        description: Não autorizado
      403:
        description: Acesso negado
      404:
        description: Pedido não encontrado
    """
    try:
        user_data = request.user
        # Apenas admin pode deletar pedidos
        if not user_data.get('is_admin', False):
            return jsonify({'erro': 'Apenas administradores podem remover pedidos'}), 403

        permanente = request.args.get('permanente', 'false').lower() == 'true'
        resultado = PedidoService.deletar_pedido(pedido_id, permanente)
        return jsonify(resultado), 200

    except ValueError as e:
        return jsonify({'erro': str(e)}), 404
    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@pedidos_bp.route('/estatisticas', methods=['GET'])
@token_required
def obter_estatisticas_pedidos():
    """
    Obtém estatísticas dos pedidos (apenas para funcionários)
    ---
    tags:
      - Pedidos
    security:
      - Bearer: []
    responses:
      200:
        description: Estatísticas dos pedidos
      401:
        description: Não autorizado
      403:
        description: Acesso negado
    """
    try:
        user_data = request.user
        # Apenas funcionários podem ver estatísticas
        if user_data['role'] not in ['manager', 'attendant'] and not user_data.get('is_admin', False):
            return jsonify({'erro': 'Acesso negado'}), 403

        estatisticas = PedidoService.obter_estatisticas()
        return jsonify(estatisticas), 200

    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500


@pedidos_bp.route('/status', methods=['GET'])
def listar_status_pedidos():
    """
    Lista todos os status possíveis de pedidos
    ---
    tags:
      - Pedidos
    responses:
      200:
        description: Lista de status
    """
    try:
        status_list = [status.value for status in StatusPedido]
        return jsonify({
            'status': status_list,
            'total': len(status_list)
        }), 200

    except Exception as e:
        return jsonify({'erro': 'Erro interno do servidor'}), 500
