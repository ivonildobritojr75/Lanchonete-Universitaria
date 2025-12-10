from app.models.db import get_connection
from app.models.categoria import Categoria
import sqlite3
from datetime import datetime


class CategoriaRepository:
    """Repository para operações CRUD de categorias no banco de dados"""

    @staticmethod
    def criar(categoria):
        """Cria uma nova categoria no banco"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                INSERT INTO categorias (nome, descricao, ativo)
                VALUES (?, ?, ?)
            """, (categoria.nome, categoria.descricao, categoria.ativo))

            categoria.id = cursor.lastrowid
            conn.commit()

            return categoria
        finally:
            conn.close()

    @staticmethod
    def buscar_por_id(categoria_id):
        """Busca categoria por ID"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, nome, descricao, ativo, criado_em, atualizado_em
            FROM categorias
            WHERE id = ? AND ativo = 1
        """, (categoria_id,))

        row = cursor.fetchone()
        conn.close()

        if row:
            return Categoria(
                id=row[0],
                nome=row[1],
                descricao=row[2],
                ativo=bool(row[3]),
                criado_em=datetime.fromisoformat(row[4]) if row[4] else None,
                atualizado_em=datetime.fromisoformat(row[5]) if row[5] else None
            )
        return None

    @staticmethod
    def listar_todas():
        """Lista todas as categorias ativas"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, nome, descricao, ativo, criado_em, atualizado_em
            FROM categorias
            WHERE ativo = 1
            ORDER BY nome
        """)

        rows = cursor.fetchall()
        conn.close()

        return [Categoria(
            id=row[0],
            nome=row[1],
            descricao=row[2],
            ativo=bool(row[3]),
            criado_em=datetime.fromisoformat(row[4]) if row[4] else None,
            atualizado_em=datetime.fromisoformat(row[5]) if row[5] else None
        ) for row in rows]

    @staticmethod
    def atualizar(categoria_id, **campos):
        """Atualiza campos específicos de uma categoria"""
        conn = get_connection()
        cursor = conn.cursor()

        # Verificar se categoria existe
        categoria = CategoriaRepository.buscar_por_id(categoria_id)
        if not categoria:
            conn.close()
            raise ValueError("Categoria não encontrada")

        # Preparar campos para atualizar
        campos_sql = []
        valores = []

        campos_permitidos = ['nome', 'descricao', 'ativo']

        for campo in campos_permitidos:
            if campo in campos:
                campos_sql.append(f"{campo} = ?")
                valores.append(campos[campo])

        if not campos_sql:
            conn.close()
            raise ValueError("Nenhum campo válido para atualizar")

        campos_sql.append("atualizado_em = CURRENT_TIMESTAMP")
        valores.append(categoria_id)

        query = f"UPDATE categorias SET {', '.join(campos_sql)} WHERE id = ?"
        cursor.execute(query, valores)

        conn.commit()
        conn.close()

        # Retornar categoria atualizada
        return CategoriaRepository.buscar_por_id(categoria_id)

    @staticmethod
    def deletar(categoria_id):
        """Remove uma categoria (soft delete)"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE categorias
            SET ativo = 0, atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (categoria_id,))

        if cursor.rowcount == 0:
            conn.close()
            raise ValueError("Categoria não encontrada")

        conn.commit()
        conn.close()

        return True

    @staticmethod
    def deletar_permanentemente(categoria_id):
        """Remove uma categoria permanentemente do banco"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM categorias WHERE id = ?", (categoria_id,))

        if cursor.rowcount == 0:
            conn.close()
            raise ValueError("Categoria não encontrada")

        conn.commit()
        conn.close()

        return True

    @staticmethod
    def contar_categorias():
        """Conta total de categorias ativas"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM categorias WHERE ativo = 1")
        count = cursor.fetchone()[0]
        conn.close()

        return count

    @staticmethod
    def buscar_por_nome(nome):
        """Busca categoria por nome exato"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, nome, descricao, ativo, criado_em, atualizado_em
            FROM categorias
            WHERE nome = ? AND ativo = 1
        """, (nome,))

        row = cursor.fetchone()
        conn.close()

        if row:
            return Categoria(
                id=row[0],
                nome=row[1],
                descricao=row[2],
                ativo=bool(row[3]),
                criado_em=datetime.fromisoformat(row[4]) if row[4] else None,
                atualizado_em=datetime.fromisoformat(row[5]) if row[5] else None
            )
        return None
