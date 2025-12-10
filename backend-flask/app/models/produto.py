from datetime import datetime
import re


class Produto:
    """Modelo de dados para Produto"""

    def __init__(self, id=None, nome=None, preco=None, categoria=None,
                 disponivel=True, imagem=None, descricao=None,
                 criado_em=None, atualizado_em=None):
        self.id = id
        self.nome = nome
        self.preco = preco
        self.categoria = categoria
        self.disponivel = disponivel
        self.imagem = imagem
        self.descricao = descricao
        self.criado_em = criado_em or datetime.now()
        self.atualizado_em = atualizado_em or datetime.now()

    def to_dict(self):
        """Converte o objeto para dicionário (para JSON)"""
        return {
            'id': self.id,
            'nome': self.nome,
            'preco': self.preco,
            'categoria': self.categoria,
            'disponivel': self.disponivel,
            'imagem': self.imagem,
            'descricao': self.descricao,
            'criado_em': self.criado_em.isoformat() if self.criado_em else None,
            'atualizado_em': (self.atualizado_em.isoformat()
                              if self.atualizado_em else None)
        }

    @staticmethod
    def from_dict(data):
        """Cria um objeto Produto a partir de um dicionário"""
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

        return Produto(
            id=data.get('id'),
            nome=data.get('nome'),
            preco=data.get('preco'),
            categoria=data.get('categoria'),
            disponivel=data.get('disponivel', True),
            imagem=data.get('imagem'),
            descricao=data.get('descricao'),
            criado_em=criado_em,
            atualizado_em=atualizado_em
        )

    def validar(self):
        """Valida os dados do produto"""
        erros = []

        if not self.nome or len(self.nome.strip()) < 2:
            erros.append("Nome deve ter pelo menos 2 caracteres")

        if self.preco is None or self.preco < 0:
            erros.append("Preço deve ser maior ou igual a zero")

        if not self.categoria or len(self.categoria.strip()) < 2:
            erros.append("Categoria deve ter pelo menos 2 caracteres")

        if self.imagem and len(self.imagem) > 500:
            erros.append("URL da imagem muito longa (máximo 500 caracteres)")

        if self.descricao and len(self.descricao) > 1000:
            erros.append("Descrição muito longa (máximo 1000 caracteres)")

        if erros:
            raise ValueError("; ".join(erros))

        return True

    def __repr__(self):
        return (
            f"<Produto(id={self.id}, nome='{self.nome}', "
            f"categoria='{self.categoria}')>")
