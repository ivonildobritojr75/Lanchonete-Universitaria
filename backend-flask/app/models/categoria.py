from datetime import datetime


class Categoria:
    """Modelo de dados para Categoria de Produto"""

    def __init__(self, id=None, nome=None, descricao=None,
                 ativo=True, criado_em=None, atualizado_em=None):
        self.id = id
        self.nome = nome
        self.descricao = descricao
        self.ativo = ativo
        self.criado_em = criado_em or datetime.now()
        self.atualizado_em = atualizado_em or datetime.now()

    def to_dict(self):
        """Converte o objeto para dicionário (para JSON)"""
        return {
            'id': self.id,
            'nome': self.nome,
            'descricao': self.descricao,
            'ativo': self.ativo,
            'criado_em': self.criado_em.isoformat() if self.criado_em else None,
            'atualizado_em': (self.atualizado_em.isoformat()
                              if self.atualizado_em else None)
        }

    @staticmethod
    def from_dict(data):
        """Cria um objeto Categoria a partir de um dicionário"""
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

        return Categoria(
            id=data.get('id'),
            nome=data.get('nome'),
            descricao=data.get('descricao'),
            ativo=data.get('ativo', True),
            criado_em=criado_em,
            atualizado_em=atualizado_em
        )

    def validar(self):
        """Valida os dados da categoria"""
        erros = []

        if not self.nome or len(self.nome.strip()) < 2:
            erros.append("Nome deve ter pelo menos 2 caracteres")

        if self.descricao and len(self.descricao) > 500:
            erros.append("Descrição muito longa (máximo 500 caracteres)")

        if erros:
            raise ValueError("; ".join(erros))

        return True

    def __repr__(self):
        return (
            f"<Categoria(id={self.id}, nome='{self.nome}')>")
