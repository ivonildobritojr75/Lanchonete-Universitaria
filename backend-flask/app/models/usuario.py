from datetime import datetime
import re


class Usuario:
    """Modelo de dados para Usuário"""

    def __init__(self, id=None, nome=None, email=None, senha=None,
                 telefone=None, role=None, is_admin=False, ativo=True,
                 criado_em=None, atualizado_em=None):
        self.id = id
        self.nome = nome
        self.email = email
        self.senha = senha  # Em produção, deve ser o hash
        self.telefone = telefone
        self.role = role or "client"  # Valor padrão: client
        self.is_admin = is_admin
        self.ativo = ativo
        self.criado_em = criado_em or datetime.now()
        self.atualizado_em = atualizado_em or datetime.now()

    def to_dict(self):
        """Converte o objeto para dicionário (para JSON)"""
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'telefone': self.telefone,
            'role': self.role,
            'is_admin': self.is_admin,
            'ativo': self.ativo,
            'criado_em': self.criado_em.isoformat() if self.criado_em else None,
            'atualizado_em': (self.atualizado_em.isoformat()
                              if self.atualizado_em else None)
        }

    @staticmethod
    def from_dict(data):
        """Cria um objeto Usuario a partir de um dicionário"""
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

        return Usuario(
            id=data.get('id'),
            nome=data.get('nome'),
            email=data.get('email'),
            senha=data.get('senha'),
            telefone=data.get('telefone'),
            role=data.get('role'),
            is_admin=data.get('is_admin', False),
            ativo=data.get('ativo', True),
            criado_em=criado_em,
            atualizado_em=atualizado_em
        )

    def validar(self):
        """Valida os dados do usuário"""
        erros = []

        if not self.nome or len(self.nome.strip()) < 2:
            erros.append("Nome deve ter pelo menos 2 caracteres")

        if not self.email or not self._validar_email(self.email):
            erros.append("Email inválido")

        if not self.senha or len(self.senha) < 6:
            erros.append("Senha deve ter pelo menos 6 caracteres")

        if self.telefone and not self._validar_telefone(self.telefone):
            erros.append(
                "Telefone inválido (formato esperado: (11) 99999-9999)")

        if self.role and self.role not in ['client', 'attendant', 'manager']:
            erros.append("Role deve ser: client, attendant ou manager")

        if erros:
            raise ValueError("; ".join(erros))

        return True

    def _validar_email(self, email):
        """Valida formato do email usando regex simples"""
        padrao = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(padrao, email) is not None

    def _validar_telefone(self, telefone):
        """Valida formato do telefone usando regex simples"""
        # Remove espaços e caracteres especiais para validação
        telefone_limpo = re.sub(r'[()\-\s]', '', telefone)

        # Aceita formatos: (11)99999-9999, 11999999999, 11 99999-9999
        padrao = r'^\(?\d{2}\)?\s?\d{5}-?\d{4}$'
        return (re.match(padrao, telefone) is not None
                and len(telefone_limpo) == 11)

    def __repr__(self):
        return (
            f"<Usuario(id={self.id}, nome='{self.nome}', "
            f"email='{self.email}')>")
