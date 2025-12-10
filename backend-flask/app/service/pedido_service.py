from app.models.pedido import Pedido, ItemPedido, StatusPedido
from app.repositories.pedido_repository import PedidoRepository, ItemPedidoRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.repositories.produto_repository import ProdutoRepository
from datetime import datetime


class PedidoService:
    """Serviço de lógica de negócio para pedidos"""

    @staticmethod
    def criar_pedido(dados, itens_carrinho):
        """Cria um novo pedido com seus itens"""
        try:
            # Verificar se usuário existe
            usuario = UsuarioRepository.buscar_por_id(dados['usuario_id'])
            if not usuario:
                raise ValueError("Usuário não encontrado")

            # Calcular total
            total = 0.0
            itens_validos = []

            for item_cart in itens_carrinho:
                produto = ProdutoRepository.buscar_por_id(item_cart['produto_id'])
                if not produto:
                    raise ValueError(f"Produto {item_cart['produto_id']} não encontrado")

                if not produto.disponivel:
                    raise ValueError(f"Produto '{produto.nome}' não está disponível")

                preco_unitario = produto.preco
                quantidade = item_cart['quantidade']
                total += preco_unitario * quantidade

                itens_validos.append({
                    'produto_id': produto.id,
                    'quantidade': quantidade,
                    'preco_unitario': preco_unitario
                })

            # Criar pedido
            pedido = Pedido(
                usuario_id=dados['usuario_id'],
                status=StatusPedido.EM_ANDAMENTO.value,
                total=total,
                observacoes=dados.get('observacoes')
            )

            pedido.validar()
            pedido_criado = PedidoRepository.criar(pedido)

            # Criar itens do pedido
            for item_data in itens_validos:
                item_pedido = ItemPedido(
                    pedido_id=pedido_criado.id,
                    produto_id=item_data['produto_id'],
                    quantidade=item_data['quantidade'],
                    preco_unitario=item_data['preco_unitario']
                )
                item_pedido.validar()
                ItemPedidoRepository.criar(item_pedido)

            return pedido_criado.to_dict()

        except ValueError as e:
            raise ValueError(f"Erro de validação: {str(e)}")
        except Exception as e:
            raise Exception(f"Erro ao criar pedido: {str(e)}")

    @staticmethod
    def buscar_pedido_por_id(pedido_id):
        """Busca um pedido por ID com seus itens"""
        try:
            pedido = PedidoRepository.buscar_por_id(pedido_id)
            if not pedido:
                raise ValueError("Pedido não encontrado")

            # Buscar itens do pedido com dados do produto
            itens = ItemPedidoRepository.buscar_por_pedido(pedido_id)

            pedido_dict = pedido.to_dict()
            pedido_dict['itens'] = itens

            return pedido_dict
        except Exception as e:
            raise Exception(f"Erro ao buscar pedido: {str(e)}")

    @staticmethod
    def listar_pedidos_usuario(usuario_id, status=None):
        """Lista pedidos de um usuário"""
        try:
            pedidos = PedidoRepository.buscar_por_usuario(usuario_id, status)
            pedidos_com_itens = []

            for pedido in pedidos:
                itens = ItemPedidoRepository.buscar_por_pedido(pedido.id)
                pedido_dict = pedido.to_dict()
                pedido_dict['itens'] = itens
                pedidos_com_itens.append(pedido_dict)

            return {
                'pedidos': pedidos_com_itens,
                'total': len(pedidos_com_itens)
            }
        except Exception as e:
            raise Exception(f"Erro ao listar pedidos: {str(e)}")

    @staticmethod
    def listar_todos_pedidos(status=None, limit=50, offset=0):
        """Lista todos os pedidos (para admin/attendant)"""
        try:
            pedidos = PedidoRepository.listar_todos(status, limit, offset)
            pedidos_com_itens = []

            for pedido in pedidos:
                itens = ItemPedidoRepository.buscar_por_pedido(pedido.id)
                pedido_dict = pedido.to_dict()
                pedido_dict['itens'] = itens
                pedidos_com_itens.append(pedido_dict)

            return {
                'pedidos': pedidos_com_itens,
                'total': len(pedidos_com_itens)
            }
        except Exception as e:
            raise Exception(f"Erro ao listar pedidos: {str(e)}")

    @staticmethod
    def atualizar_status_pedido(pedido_id, novo_status, usuario_atual):
        """Atualiza o status de um pedido"""
        try:
            # Verificar se o status é válido
            if novo_status not in [s.value for s in StatusPedido]:
                raise ValueError(f"Status inválido: {novo_status}")

            # Buscar pedido atual
            pedido_atual = PedidoRepository.buscar_por_id(pedido_id)
            if not pedido_atual:
                raise ValueError("Pedido não encontrado")

            # Regras de transição de status
            # Managers podem finalizar ou cancelar pedidos de qualquer status
            if hasattr(usuario_atual, 'role') and usuario_atual.role == 'manager':
                # Managers têm permissões especiais
                if novo_status not in [StatusPedido.FINALIZADO.value, StatusPedido.CANCELADO.value]:
                    raise ValueError("Managers podem apenas finalizar ou cancelar pedidos")
                # Managers podem fazer essas transições de qualquer status (exceto já finalizados/cancelados)
                if pedido_atual.status in [StatusPedido.FINALIZADO.value, StatusPedido.CANCELADO.value]:
                    raise ValueError("Não é possível alterar pedidos já finalizados ou cancelados")
            else:
                # Regras normais para attendants
                transicoes_permitidas = {
                    StatusPedido.EM_ANDAMENTO.value: [StatusPedido.PREPARANDO.value, StatusPedido.CANCELADO.value],
                    StatusPedido.PREPARANDO.value: [StatusPedido.PRONTO.value, StatusPedido.CANCELADO.value],
                    StatusPedido.PRONTO.value: [StatusPedido.FINALIZADO.value],
                    StatusPedido.FINALIZADO.value: [],  # Status final
                    StatusPedido.CANCELADO.value: []   # Status final
                }

                if novo_status not in transicoes_permitidas.get(pedido_atual.status, []):
                    if pedido_atual.status != novo_status:  # Permitir manter o mesmo status
                        raise ValueError(f"Transição de '{pedido_atual.status}' para '{novo_status}' não permitida")

            pedido_atualizado = PedidoRepository.atualizar(pedido_id, status=novo_status)
            pedido_dict = pedido_atualizado.to_dict()

            # Incluir itens com dados do produto
            itens = ItemPedidoRepository.buscar_por_pedido(pedido_id)
            pedido_dict['itens'] = itens

            return pedido_dict

        except ValueError as e:
            raise ValueError(f"Erro de validação: {str(e)}")
        except Exception as e:
            raise Exception(f"Erro ao atualizar pedido: {str(e)}")

    @staticmethod
    def cancelar_pedido(pedido_id, usuario_id):
        """Cancela um pedido (apenas pelo próprio usuário ou admin)"""
        try:
            pedido = PedidoRepository.buscar_por_id(pedido_id)
            if not pedido:
                raise ValueError("Pedido não encontrado")

            # Verificar se o usuário pode cancelar
            usuario = UsuarioRepository.buscar_por_id(usuario_id)
            if not usuario:
                raise ValueError("Usuário não encontrado")

            # Só permite cancelar se for o próprio usuário ou admin
            if pedido.usuario_id != usuario_id and not usuario.is_admin:
                raise ValueError("Você não tem permissão para cancelar este pedido")

            # Só permite cancelar pedidos em andamento ou preparando
            if pedido.status not in [StatusPedido.EM_ANDAMENTO.value, StatusPedido.PREPARANDO.value]:
                raise ValueError("Este pedido não pode mais ser cancelado")

            return PedidoService.atualizar_status_pedido(pedido_id, StatusPedido.CANCELADO.value, usuario)

        except ValueError as e:
            raise ValueError(f"Erro de validação: {str(e)}")
        except Exception as e:
            raise Exception(f"Erro ao cancelar pedido: {str(e)}")

    @staticmethod
    def obter_estatisticas():
        """Obtém estatísticas dos pedidos"""
        try:
            return PedidoRepository.obter_estatisticas()
        except Exception as e:
            raise Exception(f"Erro ao obter estatísticas: {str(e)}")

    @staticmethod
    def deletar_pedido(pedido_id, permanente=False):
        """Remove um pedido"""
        try:
            if permanente:
                PedidoRepository.deletar_permanentemente(pedido_id)
                return {"mensagem": "Pedido removido permanentemente"}
            else:
                pedido_atualizado = PedidoRepository.deletar(pedido_id)
                return {"mensagem": "Pedido cancelado", "pedido": pedido_atualizado.to_dict()}
        except ValueError as e:
            raise ValueError(str(e))
        except Exception as e:
            raise Exception(f"Erro ao deletar pedido: {str(e)}")
