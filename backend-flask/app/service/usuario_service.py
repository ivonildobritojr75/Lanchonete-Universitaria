from app.models.usuario import Usuario
from app.repositories.usuario_repository import UsuarioRepository

class UsuarioService:
    """Serviço de lógica de negócio para usuários"""

    @staticmethod
    def criar_usuario(dados):
        """Cria um novo usuário com validações de negócio"""
        try:
            # Criar objeto Usuario
            usuario = Usuario(
                nome=dados.get('nome'),
                email=dados.get('email'),
                telefone=dados.get('telefone'),
                senha=dados.get('senha'),
                role=dados.get('role'),
                is_admin=dados.get('is_admin', False)
            )

            # Validar dados
            usuario.validar()

            # Verificar se email já existe (dupla verificação)
            usuario_existente = UsuarioRepository.buscar_por_email(usuario.email)
            if usuario_existente:
                raise ValueError("Email já cadastrado")

            # Em produção, aqui seria feito o hash da senha
            # usuario.senha = hash_senha(usuario.senha)

            # Salvar no banco
            usuario_criado = UsuarioRepository.criar(usuario)

            # Retornar dados sem senha
            return {
                'id': usuario_criado.id,
                'nome': usuario_criado.nome,
                'email': usuario_criado.email,
                'telefone': usuario_criado.telefone,
                'role': usuario_criado.role,
                'is_admin': usuario_criado.is_admin,
                'criado_em': usuario_criado.criado_em.isoformat() if usuario_criado.criado_em else None
            }

        except ValueError as e:
            raise ValueError(f"Erro de validação: {str(e)}")
        except Exception as e:
            raise Exception(f"Erro ao criar usuário: {str(e)}")

    @staticmethod
    def buscar_usuario_por_id(usuario_id):
        """Busca um usuário por ID"""
        try:
            usuario = UsuarioRepository.buscar_por_id(usuario_id)
            if not usuario:
                raise ValueError("Usuário não encontrado")

            return usuario.to_dict()
        except Exception as e:
            raise Exception(f"Erro ao buscar usuário: {str(e)}")

    @staticmethod
    def buscar_usuario_por_email(email):
        """Busca um usuário por email (para autenticação)"""
        try:
            usuario = UsuarioRepository.buscar_por_email(email)
            if not usuario:
                return None

            return usuario.to_dict()
        except Exception as e:
            raise Exception(f"Erro ao buscar usuário por email: {str(e)}")

    @staticmethod
    def listar_usuarios():
        """Lista todos os usuários"""
        try:
            usuarios = UsuarioRepository.listar_todos()
            return {
                'usuarios': [usuario.to_dict() for usuario in usuarios],
                'total': len(usuarios)
            }
        except Exception as e:
            raise Exception(f"Erro ao listar usuários: {str(e)}")

    @staticmethod
    def atualizar_usuario(usuario_id, dados):
        """Atualiza dados de um usuário"""
        try:
            # Verificar se há campos para atualizar
            campos_permitidos = ['nome', 'email', 'telefone', 'role', 'is_admin']
            campos_para_atualizar = {}

            for campo in campos_permitidos:
                if campo in dados:
                    campos_para_atualizar[campo] = dados[campo]

            if not campos_para_atualizar:
                raise ValueError("Nenhum campo válido para atualizar")

            # Validar email se estiver sendo atualizado
            if 'email' in campos_para_atualizar:
                # Validar formato do email
                usuario_temp = Usuario(email=campos_para_atualizar['email'])
                usuario_temp._validar_email(campos_para_atualizar['email'])

            # Validar telefone se estiver sendo atualizado
            if 'telefone' in campos_para_atualizar:
                usuario_temp = Usuario(telefone=campos_para_atualizar['telefone'])
                usuario_temp._validar_telefone(campos_para_atualizar['telefone'])

            # Atualizar no banco
            usuario_atualizado = UsuarioRepository.atualizar(usuario_id, **campos_para_atualizar)

            return usuario_atualizado.to_dict()

        except ValueError as e:
            raise ValueError(f"Erro de validação: {str(e)}")
        except Exception as e:
            raise Exception(f"Erro ao atualizar usuário: {str(e)}")

    @staticmethod
    def deletar_usuario(usuario_id):
        """Remove um usuário (soft delete)"""
        try:
            UsuarioRepository.deletar(usuario_id)
            return {"mensagem": "Usuário removido com sucesso"}
        except ValueError as e:
            raise ValueError(str(e))
        except Exception as e:
            raise Exception(f"Erro ao deletar usuário: {str(e)}")

    @staticmethod
    def obter_estatisticas():
        """Obtém estatísticas dos usuários"""
        try:
            total_usuarios = UsuarioRepository.contar_usuarios()

            # Contar administradores
            usuarios = UsuarioRepository.listar_todos()
            total_admins = sum(1 for u in usuarios if u.is_admin)

            return {
                'total_usuarios': total_usuarios,
                'total_administradores': total_admins,
                'total_usuarios_comuns': total_usuarios - total_admins
            }
        except Exception as e:
            raise Exception(f"Erro ao obter estatísticas: {str(e)}")

    @staticmethod
    def validar_credenciais(email, senha, role=None):
        """Valida credenciais para login"""
        try:
            usuario = UsuarioRepository.buscar_por_email(email)
            if not usuario:
                return None

            # Em produção, comparar hash da senha
            # if not verificar_senha(senha, usuario.senha):
            #     return None

            # Por enquanto, comparação simples (NÃO FAZER ISSO EM PRODUÇÃO)
            if usuario.senha != senha:
                return None

            # Validar role se especificado
            if role and usuario.role != role:
                return None

            return usuario.to_dict()
        except Exception as e:
            raise Exception(f"Erro ao validar credenciais: {str(e)}")

    @staticmethod
    def validar_credenciais_por_role(email, senha, role):
        """Valida credenciais considerando especificamente o role do usuário"""
        try:
            usuario = UsuarioRepository.buscar_por_email(email)
            if not usuario:
                return None

            # Verificar senha
            if usuario.senha != senha:
                return None

            # Verificar se o role do usuário corresponde ao esperado
            if usuario.role != role:
                return None

            return usuario.to_dict()
        except Exception as e:
            raise Exception(f"Erro ao validar credenciais por role: {str(e)}")
