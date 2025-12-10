from app.models.db import get_connection
from app.models.pedido import Pedido, ItemPedido, StatusPedido
import sqlite3
from datetime import datetime


class PedidoRepository:
    """Repository para operações CRUD de pedidos no banco de dados"""

    @staticmethod
    def criar(pedido):
        """Cria um novo pedido no banco"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                INSERT INTO pedidos (usuario_id, status, total, observacoes)
                VALUES (?, ?, ?, ?)
            """, (pedido.usuario_id, pedido.status, pedido.total, pedido.observacoes))

            pedido.id = cursor.lastrowid
            conn.commit()

            return pedido
        finally:
            conn.close()

    @staticmethod
    def buscar_por_id(pedido_id):
        """Busca pedido por ID"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, usuario_id, status, total, observacoes, criado_em, atualizado_em
            FROM pedidos
            WHERE id = ?
        """, (pedido_id,))

        row = cursor.fetchone()
        conn.close()

        if row:
            return Pedido(
                id=row[0],
                usuario_id=row[1],
                status=row[2],
                total=row[3],
                observacoes=row[4],
                criado_em=row[5],
                atualizado_em=row[6]
            )
        return None

    @staticmethod
    def buscar_por_usuario(usuario_id, status=None):
        """Busca pedidos por usuário, opcionalmente filtrando por status"""
        conn = get_connection()
        cursor = conn.cursor()

        if status:
            cursor.execute("""
                SELECT id, usuario_id, status, total, observacoes, criado_em, atualizado_em
                FROM pedidos
                WHERE usuario_id = ? AND status = ?
                ORDER BY criado_em DESC
            """, (usuario_id, status))
        else:
            cursor.execute("""
                SELECT id, usuario_id, status, total, observacoes, criado_em, atualizado_em
                FROM pedidos
                WHERE usuario_id = ?
                ORDER BY criado_em DESC
            """, (usuario_id,))

        rows = cursor.fetchall()
        conn.close()

        pedidos = []
        for row in rows:
            pedidos.append(Pedido(
                id=row[0],
                usuario_id=row[1],
                status=row[2],
                total=row[3],
                observacoes=row[4],
                criado_em=row[5],
                atualizado_em=row[6]
            ))

        return pedidos

    @staticmethod
    def listar_todos(status=None, limit=None, offset=0):
        """Lista todos os pedidos, opcionalmente filtrando por status"""
        conn = get_connection()
        cursor = conn.cursor()

        query = """
            SELECT id, usuario_id, status, total, observacoes, criado_em, atualizado_em
            FROM pedidos
        """
        params = []

        if status:
            query += " WHERE status = ?"
            params.append(status)

        query += " ORDER BY criado_em DESC"

        if limit:
            query += " LIMIT ? OFFSET ?"
            params.extend([limit, offset])

        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()

        pedidos = []
        for row in rows:
            pedidos.append(Pedido(
                id=row[0],
                usuario_id=row[1],
                status=row[2],
                total=row[3],
                observacoes=row[4],
                criado_em=row[5],
                atualizado_em=row[6]
            ))

        return pedidos

    @staticmethod
    def atualizar(pedido_id, **kwargs):
        """Atualiza dados de um pedido"""
        conn = get_connection()
        cursor = conn.cursor()

        campos_permitidos = ['status', 'total', 'observacoes']
        campos_para_atualizar = {}
        valores = []

        for campo in campos_permitidos:
            if campo in kwargs:
                campos_para_atualizar[campo] = kwargs[campo]

        if not campos_para_atualizar:
            conn.close()
            raise ValueError("Nenhum campo válido para atualizar")

        # Adicionar atualizado_em
        campos_para_atualizar['atualizado_em'] = datetime.now()

        set_clause = ", ".join([f"{campo} = ?" for campo in campos_para_atualizar.keys()])
        valores = list(campos_para_atualizar.values())
        valores.append(pedido_id)

        try:
            cursor.execute(f"""
                UPDATE pedidos
                SET {set_clause}
                WHERE id = ?
            """, valores)

            if cursor.rowcount == 0:
                raise ValueError("Pedido não encontrado")

            conn.commit()

            # Retornar pedido atualizado
            return PedidoRepository.buscar_por_id(pedido_id)
        finally:
            conn.close()

    @staticmethod
    def deletar(pedido_id):
        """Remove um pedido (soft delete - marca como cancelado)"""
        return PedidoRepository.atualizar(pedido_id, status=StatusPedido.CANCELADO.value)

    @staticmethod
    def deletar_permanentemente(pedido_id):
        """Remove um pedido permanentemente do banco"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("DELETE FROM itens_pedido WHERE pedido_id = ?", (pedido_id,))
            cursor.execute("DELETE FROM pedidos WHERE id = ?", (pedido_id,))

            if cursor.rowcount == 0:
                raise ValueError("Pedido não encontrado")

            conn.commit()
        finally:
            conn.close()

    @staticmethod
    def contar_pedidos(status=None):
        """Conta pedidos, opcionalmente por status"""
        conn = get_connection()
        cursor = conn.cursor()

        if status:
            cursor.execute("SELECT COUNT(*) FROM pedidos WHERE status = ?", (status,))
        else:
            cursor.execute("SELECT COUNT(*) FROM pedidos")

        count = cursor.fetchone()[0]
        conn.close()

        return count

    @staticmethod
    def obter_estatisticas():
        """Obtém estatísticas dos pedidos"""
        conn = get_connection()
        cursor = conn.cursor()

        # Contar por status
        cursor.execute("""
            SELECT status, COUNT(*) as total
            FROM pedidos
            GROUP BY status
        """)

        status_counts = {row[0]: row[1] for row in cursor.fetchall()}

        # Total de pedidos
        total_pedidos = sum(status_counts.values())

        # Receita total (somente pedidos finalizados)
        cursor.execute("""
            SELECT SUM(total) FROM pedidos WHERE status = ?
        """, (StatusPedido.FINALIZADO.value,))

        receita_total = cursor.fetchone()[0] or 0.0

        conn.close()

        return {
            'total_pedidos': total_pedidos,
            'pedidos_por_status': status_counts,
            'receita_total': receita_total
        }


class ItemPedidoRepository:
    """Repository para operações CRUD de itens de pedido"""

    @staticmethod
    def criar(item_pedido):
        """Cria um novo item de pedido"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
                VALUES (?, ?, ?, ?)
            """, (item_pedido.pedido_id, item_pedido.produto_id,
                  item_pedido.quantidade, item_pedido.preco_unitario))

            item_pedido.id = cursor.lastrowid
            conn.commit()

            return item_pedido
        finally:
            conn.close()

    @staticmethod
    def buscar_por_pedido(pedido_id):
        """Busca todos os itens de um pedido com dados do produto"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT ip.id, ip.pedido_id, ip.produto_id, ip.quantidade, ip.preco_unitario, ip.criado_em,
                   p.nome, p.imagem, p.categoria
            FROM itens_pedido ip
            JOIN produtos p ON ip.produto_id = p.id
            WHERE ip.pedido_id = ?
            ORDER BY ip.criado_em
        """, (pedido_id,))

        rows = cursor.fetchall()
        conn.close()

        itens = []
        for row in rows:
            item = ItemPedido(
                id=row[0],
                pedido_id=row[1],
                produto_id=row[2],
                quantidade=row[3],
                preco_unitario=row[4],
                criado_em=row[5]
            )
            # Adicionar dados do produto ao item
            item_dict = item.to_dict()
            item_dict['produto'] = {
                'id': row[2],
                'nome': row[6],
                'imagem': row[7],
                'categoria': row[8]
            }
            itens.append(item_dict)

        return itens

    @staticmethod
    def buscar_por_id(item_id):
        """Busca item de pedido por ID"""
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, pedido_id, produto_id, quantidade, preco_unitario, criado_em
            FROM itens_pedido
            WHERE id = ?
        """, (item_id,))

        row = cursor.fetchone()
        conn.close()

        if row:
            return ItemPedido(
                id=row[0],
                pedido_id=row[1],
                produto_id=row[2],
                quantidade=row[3],
                preco_unitario=row[4],
                criado_em=row[5]
            )
        return None

    @staticmethod
    def deletar_por_pedido(pedido_id):
        """Remove todos os itens de um pedido"""
        conn = get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("DELETE FROM itens_pedido WHERE pedido_id = ?", (pedido_id,))
            conn.commit()
        finally:
            conn.close()
