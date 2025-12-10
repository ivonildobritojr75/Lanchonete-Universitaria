from app.models.db import get_connection
from app.models.usuario import Usuario
import sqlite3
from datetime import datetime


class UsuarioRepository:
    """Repository para operações CRUD de usuários no banco de dados"""

    @staticmethod
    def criar(usuario):
        """Cria um novo usuário no banco"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                INSERT INTO usuarios (nome, email, telefone, senha, role,
                                     is_admin)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (usuario.nome, usuario.email, usuario.telefone,
                  usuario.senha, usuario.role, usuario.is_admin))

            usuario.id = cursor.lastrowid
            conn.commit()

            return usuario
        except sqlite3.IntegrityError as e:
            if 'UNIQUE constraint failed: usuarios.email' in str(e):
                raise ValueError("Email já cadastrado")
            raise e
        finally:
            conn.close()

    @staticmethod
    def buscar_por_id(usuario_id):
        """Busca usuário por ID"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, nome, email, telefone, role, is_admin, ativo,
                   criado_em, atualizado_em
            FROM usuarios
            WHERE id = ? AND ativo = 1
        """, (usuario_id,))

        row = cursor.fetchone()
        conn.close()

        if row:
            return Usuario(
                id=row[0],
                nome=row[1],
                email=row[2],
                telefone=row[3],
                role=row[4],
                is_admin=bool(row[5]),
                ativo=bool(row[6]),
                criado_em=datetime.fromisoformat(row[7]) if row[7] else None,
                atualizado_em=datetime.fromisoformat(row[8]) if row[8] else None
            )
        return None

    @staticmethod
    def buscar_por_email(email):
        """Busca usuário por email"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, nome, email, telefone, senha, role, is_admin, ativo,
                   criado_em, atualizado_em
            FROM usuarios
            WHERE email = ? AND ativo = 1
        """, (email,))

        row = cursor.fetchone()
        conn.close()

        if row:
            return Usuario(
                id=row[0],
                nome=row[1],
                email=row[2],
                telefone=row[3],
                senha=row[4],  # Incluindo senha para casos de autenticação
                role=row[5],
                is_admin=bool(row[6]),
                ativo=bool(row[7]),
                criado_em=datetime.fromisoformat(row[8]) if row[8] else None,
                atualizado_em=datetime.fromisoformat(row[9]) if row[9] else None
            )
        return None

    @staticmethod
    def listar_todos():
        """Lista todos os usuários ativos"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, nome, email, telefone, role, is_admin, criado_em
            FROM usuarios
            WHERE ativo = 1
            ORDER BY criado_em DESC
        """)

        rows = cursor.fetchall()
        conn.close()

        return [Usuario(id=row[0], nome=row[1], email=row[2], telefone=row[3],
                        role=row[4], is_admin=bool(row[5]),
                        criado_em=(datetime.fromisoformat(row[6])
                                   if row[6] else None))
                for row in rows]

    @staticmethod
    def atualizar(usuario_id, **campos):
        """Atualiza campos específicos de um usuário"""
        conn = get_connection()
        cursor = conn.cursor()

        # Verificar se usuário existe
        usuario = UsuarioRepository.buscar_por_id(usuario_id)
        if not usuario:
            conn.close()
            raise ValueError("Usuário não encontrado")

        # Preparar campos para atualizar
        campos_sql = []
        valores = []

        if 'nome' in campos:
            campos_sql.append("nome = ?")
            valores.append(campos['nome'])

        if 'email' in campos:
            # Verificar se email já existe para outro usuário
            cursor.execute(
                """SELECT id FROM usuarios WHERE email = ? AND
                   id != ? AND ativo = 1""",
                (campos['email'], usuario_id)
            )
            if cursor.fetchone():
                conn.close()
                raise ValueError("Email já está em uso por outro usuário")
            campos_sql.append("email = ?")
            valores.append(campos['email'])

        if 'telefone' in campos:
            campos_sql.append("telefone = ?")
            valores.append(campos['telefone'])

        if 'role' in campos:
            campos_sql.append("role = ?")
            valores.append(campos['role'])

        if 'is_admin' in campos:
            campos_sql.append("is_admin = ?")
            valores.append(campos['is_admin'])

        if not campos_sql:
            conn.close()
            raise ValueError("Nenhum campo para atualizar")

        campos_sql.append("atualizado_em = CURRENT_TIMESTAMP")
        valores.append(usuario_id)

        query = f"UPDATE usuarios SET {', '.join(campos_sql)} WHERE id = ?"
        cursor.execute(query, valores)

        conn.commit()
        conn.close()

        # Retornar usuário atualizado
        return UsuarioRepository.buscar_por_id(usuario_id)

    @staticmethod
    def deletar(usuario_id):
        """Desativa um usuário (soft delete)"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE usuarios
            SET ativo = 0, atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (usuario_id,))

        if cursor.rowcount == 0:
            conn.close()
            raise ValueError("Usuário não encontrado")

        conn.commit()
        conn.close()

        return True

    @staticmethod
    def contar_usuarios():
        """Conta total de usuários ativos"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM usuarios WHERE ativo = 1")
        count = cursor.fetchone()[0]
        conn.close()

        return count
