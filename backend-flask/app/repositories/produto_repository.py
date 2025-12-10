from app.models.db import get_connection
from app.models.produto import Produto
import sqlite3
from datetime import datetime


class ProdutoRepository:
    """Repository para operações CRUD de produtos no banco de dados"""

    @staticmethod
    def criar(produto):
        """Cria um novo produto no banco"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                INSERT INTO produtos (nome, preco, categoria, disponivel,
                                     imagem, descricao)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (produto.nome, produto.preco, produto.categoria,
                  produto.disponivel, produto.imagem, produto.descricao))

            produto.id = cursor.lastrowid
            conn.commit()

            return produto
        finally:
            conn.close()

    @staticmethod
    def buscar_por_id(produto_id):
        """Busca produto por ID"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, nome, preco, categoria, disponivel, imagem, descricao,
                   criado_em, atualizado_em
            FROM produtos
            WHERE id = ?
        """, (produto_id,))

        row = cursor.fetchone()
        conn.close()

        if row:
            return Produto(
                id=row[0],
                nome=row[1],
                preco=float(row[2]),
                categoria=row[3],
                disponivel=bool(row[4]),
                imagem=row[5],
                descricao=row[6],
                criado_em=datetime.fromisoformat(row[7]) if row[7] else None,
                atualizado_em=datetime.fromisoformat(row[8]) if row[8] else None
            )
        return None

    @staticmethod
    def buscar_por_categoria(categoria):
        """Busca produtos por categoria"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, nome, preco, categoria, disponivel, imagem, descricao,
                   criado_em, atualizado_em
            FROM produtos
            WHERE categoria = ? AND disponivel = 1
            ORDER BY nome
        """, (categoria,))

        rows = cursor.fetchall()
        conn.close()

        return [Produto(
            id=row[0],
            nome=row[1],
            preco=float(row[2]),
            categoria=row[3],
            disponivel=bool(row[4]),
            imagem=row[5],
            descricao=row[6],
            criado_em=datetime.fromisoformat(row[7]) if row[7] else None,
            atualizado_em=datetime.fromisoformat(row[8]) if row[8] else None
        ) for row in rows]

    @staticmethod
    def listar_todos(disponiveis_apenas=False):
        """Lista todos os produtos"""
        conn = get_connection()
        cursor = conn.cursor()

        query = """
            SELECT id, nome, preco, categoria, disponivel, imagem, descricao,
                   criado_em, atualizado_em
            FROM produtos
        """
        params = []

        if disponiveis_apenas:
            query += " WHERE disponivel = 1"

        query += " ORDER BY nome"

        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()

        return [Produto(
            id=row[0],
            nome=row[1],
            preco=float(row[2]),
            categoria=row[3],
            disponivel=bool(row[4]),
            imagem=row[5],
            descricao=row[6],
            criado_em=datetime.fromisoformat(row[7]) if row[7] else None,
            atualizado_em=datetime.fromisoformat(row[8]) if row[8] else None
        ) for row in rows]

    @staticmethod
    def atualizar(produto_id, **campos):
        """Atualiza campos específicos de um produto"""
        conn = get_connection()
        cursor = conn.cursor()

        # Verificar se produto existe
        produto = ProdutoRepository.buscar_por_id(produto_id)
        if not produto:
            conn.close()
            raise ValueError("Produto não encontrado")

        # Preparar campos para atualizar
        campos_sql = []
        valores = []

        campos_permitidos = ['nome', 'preco', 'categoria', 'disponivel',
                           'imagem', 'descricao']

        for campo in campos_permitidos:
            if campo in campos:
                campos_sql.append(f"{campo} = ?")
                valores.append(campos[campo])

        if not campos_sql:
            conn.close()
            raise ValueError("Nenhum campo válido para atualizar")

        campos_sql.append("atualizado_em = CURRENT_TIMESTAMP")
        valores.append(produto_id)

        query = f"UPDATE produtos SET {', '.join(campos_sql)} WHERE id = ?"
        cursor.execute(query, valores)

        conn.commit()
        conn.close()

        # Retornar produto atualizado
        return ProdutoRepository.buscar_por_id(produto_id)

    @staticmethod
    def deletar(produto_id):
        """Remove um produto (soft delete - marca como indisponível)"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE produtos
            SET disponivel = 0, atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (produto_id,))

        if cursor.rowcount == 0:
            conn.close()
            raise ValueError("Produto não encontrado")

        conn.commit()
        conn.close()

        return True

    @staticmethod
    def deletar_permanentemente(produto_id):
        """Remove um produto permanentemente do banco"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM produtos WHERE id = ?", (produto_id,))

        if cursor.rowcount == 0:
            conn.close()
            raise ValueError("Produto não encontrado")

        conn.commit()
        conn.close()

        return True

    @staticmethod
    def contar_produtos():
        """Conta total de produtos"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM produtos")
        count = cursor.fetchone()[0]
        conn.close()

        return count

    @staticmethod
    def buscar_por_nome_parcial(termo):
        """Busca produtos por nome parcial"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, nome, preco, categoria, disponivel, imagem, descricao,
                   criado_em, atualizado_em
            FROM produtos
            WHERE nome LIKE ? AND disponivel = 1
            ORDER BY nome
        """, (f"%{termo}%",))

        rows = cursor.fetchall()
        conn.close()

        return [Produto(
            id=row[0],
            nome=row[1],
            preco=float(row[2]),
            categoria=row[3],
            disponivel=bool(row[4]),
            imagem=row[5],
            descricao=row[6],
            criado_em=datetime.fromisoformat(row[7]) if row[7] else None,
            atualizado_em=datetime.fromisoformat(row[8]) if row[8] else None
        ) for row in rows]
