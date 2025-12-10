#!/usr/bin/env python3
"""Script de teste para verificar se os pedidos estão retornando dados do produto"""

from app import create_app
from app.service.pedido_service import PedidoService
import json

def test_pedidos():
    """Testa se os pedidos estão retornando dados do produto"""
    app = create_app()
    with app.app_context():
        try:
            # Listar todos os pedidos
            resultado = PedidoService.listar_todos_pedidos()

            print("=== TESTE DE PEDIDOS ===")
            print(f"Total de pedidos encontrados: {resultado['total']}")

            if resultado['total'] > 0:
                pedido = resultado['pedidos'][0]
                print(f"\nPedido ID: {pedido['id']}")
                print(f"Status: {pedido['status']}")
                print(f"Total: R$ {pedido['total']}")
                print(f"Número de itens: {len(pedido['itens'])}")

                if pedido['itens']:
                    item = pedido['itens'][0]
                    print(f"\nPrimeiro item:")
                    print(f"  ID: {item['id']}")
                    print(f"  Produto ID: {item['produto_id']}")
                    print(f"  Quantidade: {item['quantidade']}")
                    print(f"  Preço unitário: R$ {item['preco_unitario']}")

                    if 'produto' in item:
                        print(f"  Dados do produto:")
                        print(f"    Nome: {item['produto'].get('nome', 'NÃO ENCONTRADO')}")
                        print(f"    Imagem: {item['produto'].get('imagem', 'NÃO ENCONTRADO')}")
                        print(f"    Categoria: {item['produto'].get('categoria', 'NÃO ENCONTRADO')}")
                    else:
                        print("  ❌ Dados do produto NÃO encontrados!")
            else:
                print("Nenhum pedido encontrado para testar.")

        except Exception as e:
            print(f"Erro ao testar pedidos: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_pedidos()
