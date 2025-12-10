from datetime import datetime
from enum import Enum


class StatusPedido(Enum):
    """Enum para status dos pedidos"""
    EM_ANDAMENTO = "em_andamento"
    FINALIZADO = "finalizado"
    CANCELADO = "cancelado"
    PREPARANDO = "preparando"
    PRONTO = "pronto"


class Pedido:
    """Modelo de dados para Pedido"""

    def __init__(self, id=None, usuario_id=None, status=StatusPedido.EM_ANDAMENTO.value,
                 total=0.0, observacoes=None, criado_em=None, atualizado_em=None):
        self.id = id
        self.usuario_id = usuario_id
        self.status = status
        self.total = total
        self.observacoes = observacoes
        self.criado_em = criado_em or datetime.now()
        self.atualizado_em = atualizado_em or datetime.now()

    def to_dict(self):
        """Converte o objeto para dicionário (para JSON)"""
        def format_date(date):
            if date is None:
                return None
            if isinstance(date, str):
                return date
            return date.isoformat()

        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'status': self.status,
            'total': self.total,
            'observacoes': self.observacoes,
            'criado_em': format_date(self.criado_em),
            'atualizado_em': format_date(self.atualizado_em)
        }

    @staticmethod
    def from_dict(data):
        """Cria um objeto Pedido a partir de um dicionário"""
        criado_em = None
        if data.get('criado_em'):
            try:
                criado_em = datetime.fromisoformat(data['criado_em'])
            except (ValueError, TypeError):
                criado_em = None

        atualizado_em = None
        if data.get('atualizado_em'):
            try:
                atualizado_em = datetime.fromisoformat(data['atualizado_em'])
            except (ValueError, TypeError):
                atualizado_em = None

        return Pedido(
            id=data.get('id'),
            usuario_id=data.get('usuario_id'),
            status=data.get('status', StatusPedido.EM_ANDAMENTO.value),
            total=data.get('total', 0.0),
            observacoes=data.get('observacoes'),
            criado_em=criado_em,
            atualizado_em=atualizado_em
        )

    def validar(self):
        """Valida os dados do pedido"""
        erros = []

        if not self.usuario_id:
            erros.append("Usuário é obrigatório")

        if self.total < 0:
            erros.append("Total deve ser maior ou igual a zero")

        # Validar status
        status_validos = [s.value for s in StatusPedido]
        if self.status not in status_validos:
            erros.append(f"Status deve ser um dos seguintes: {', '.join(status_validos)}")

        if self.observacoes and len(self.observacoes) > 1000:
            erros.append("Observações muito longas (máximo 1000 caracteres)")

        if erros:
            raise ValueError("; ".join(erros))

        return True

    def __repr__(self):
        return (
            f"<Pedido(id={self.id}, usuario_id={self.usuario_id}, "
            f"status='{self.status}', total={self.total})>")


class ItemPedido:
    """Modelo de dados para Item de Pedido"""

    def __init__(self, id=None, pedido_id=None, produto_id=None, quantidade=1,
                 preco_unitario=0.0, criado_em=None):
        self.id = id
        self.pedido_id = pedido_id
        self.produto_id = produto_id
        self.quantidade = quantidade
        self.preco_unitario = preco_unitario
        self.criado_em = criado_em or datetime.now()

    def to_dict(self):
        """Converte o objeto para dicionário (para JSON)"""
        def format_date(date):
            if date is None:
                return None
            if isinstance(date, str):
                return date
            return date.isoformat()

        return {
            'id': self.id,
            'pedido_id': self.pedido_id,
            'produto_id': self.produto_id,
            'quantidade': self.quantidade,
            'preco_unitario': self.preco_unitario,
            'total_item': self.quantidade * self.preco_unitario,
            'criado_em': format_date(self.criado_em)
        }

    @staticmethod
    def from_dict(data):
        """Cria um objeto ItemPedido a partir de um dicionário"""
        criado_em = None
        if data.get('criado_em'):
            try:
                criado_em = datetime.fromisoformat(data['criado_em'])
            except (ValueError, TypeError):
                criado_em = None

        return ItemPedido(
            id=data.get('id'),
            pedido_id=data.get('pedido_id'),
            produto_id=data.get('produto_id'),
            quantidade=data.get('quantidade', 1),
            preco_unitario=data.get('preco_unitario', 0.0),
            criado_em=criado_em
        )

    def validar(self):
        """Valida os dados do item de pedido"""
        erros = []

        if not self.pedido_id:
            erros.append("ID do pedido é obrigatório")

        if not self.produto_id:
            erros.append("ID do produto é obrigatório")

        if self.quantidade < 1:
            erros.append("Quantidade deve ser pelo menos 1")

        if self.preco_unitario < 0:
            erros.append("Preço unitário deve ser maior ou igual a zero")

        if erros:
            raise ValueError("; ".join(erros))

        return True

    def __repr__(self):
        return (
            f"<ItemPedido(id={self.id}, pedido_id={self.pedido_id}, "
            f"produto_id={self.produto_id}, quantidade={self.quantidade})>")
