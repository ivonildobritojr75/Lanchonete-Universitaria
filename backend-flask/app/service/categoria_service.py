from app.models.categoria import Categoria
from app.repositories.categoria_repository import CategoriaRepository


class CategoriaService:
    """Serviço de lógica de negócio para categorias"""

    @staticmethod
    def criar_categoria(dados):
        """Cria uma nova categoria com validações de negócio"""
        try:
            # Verificar se categoria com mesmo nome já existe
            categoria_existente = CategoriaRepository.buscar_por_nome(dados.get('nome'))
            if categoria_existente:
                raise ValueError("Categoria com este nome já existe")

            # Criar objeto Categoria
            categoria = Categoria(
                nome=dados.get('nome'),
                descricao=dados.get('descricao'),
                ativo=dados.get('ativo', True)
            )

            # Validar dados
            categoria.validar()

            # Salvar no banco
            categoria_criada = CategoriaRepository.criar(categoria)

            # Retornar dados
            return categoria_criada.to_dict()

        except ValueError as e:
            raise ValueError(f"Erro de validação: {str(e)}")
        except Exception as e:
            raise Exception(f"Erro ao criar categoria: {str(e)}")

    @staticmethod
    def buscar_categoria_por_id(categoria_id):
        """Busca uma categoria por ID"""
        try:
            categoria = CategoriaRepository.buscar_por_id(categoria_id)
            if not categoria:
                raise ValueError("Categoria não encontrada")

            return categoria.to_dict()
        except Exception as e:
            raise Exception(f"Erro ao buscar categoria: {str(e)}")

    @staticmethod
    def listar_categorias():
        """Lista todas as categorias ativas"""
        try:
            categorias = CategoriaRepository.listar_todas()
            return {
                'categorias': [categoria.to_dict() for categoria in categorias],
                'total': len(categorias)
            }
        except Exception as e:
            raise Exception(f"Erro ao listar categorias: {str(e)}")

    @staticmethod
    def atualizar_categoria(categoria_id, dados):
        """Atualiza dados de uma categoria"""
        try:
            # Verificar campos permitidos
            campos_permitidos = ['nome', 'descricao', 'ativo']
            campos_para_atualizar = {}

            for campo in campos_permitidos:
                if campo in dados:
                    campos_para_atualizar[campo] = dados[campo]

            if not campos_para_atualizar:
                raise ValueError("Nenhum campo válido para atualizar")

            # Se nome foi alterado, verificar se já existe
            if 'nome' in campos_para_atualizar:
                categoria_existente = CategoriaRepository.buscar_por_nome(campos_para_atualizar['nome'])
                if categoria_existente and categoria_existente.id != categoria_id:
                    raise ValueError("Categoria com este nome já existe")

            # Atualizar no banco
            categoria_atualizada = CategoriaRepository.atualizar(categoria_id, **campos_para_atualizar)

            return categoria_atualizada.to_dict()

        except ValueError as e:
            raise ValueError(f"Erro de validação: {str(e)}")
        except Exception as e:
            raise Exception(f"Erro ao atualizar categoria: {str(e)}")

    @staticmethod
    def deletar_categoria(categoria_id, permanente=False):
        """Remove uma categoria"""
        try:
            # Verificar se há produtos nesta categoria
            from app.repositories.produto_repository import ProdutoRepository
            produtos_na_categoria = ProdutoRepository.buscar_por_categoria(
                CategoriaRepository.buscar_por_id(categoria_id).nome
            )

            if produtos_na_categoria:
                raise ValueError("Não é possível excluir categoria que possui produtos")

            if permanente:
                CategoriaRepository.deletar_permanentemente(categoria_id)
                return {"mensagem": "Categoria removida permanentemente"}
            else:
                CategoriaRepository.deletar(categoria_id)
                return {"mensagem": "Categoria desativada"}

        except ValueError as e:
            raise ValueError(str(e))
        except Exception as e:
            raise Exception(f"Erro ao deletar categoria: {str(e)}")

    @staticmethod
    def obter_estatisticas():
        """Obtém estatísticas das categorias"""
        try:
            total_categorias = CategoriaRepository.contar_categorias()

            # Contar produtos por categoria
            categorias = CategoriaRepository.listar_todas()
            estatisticas_categorias = []

            for categoria in categorias:
                from app.repositories.produto_repository import ProdutoRepository
                produtos = ProdutoRepository.buscar_por_categoria(categoria.nome)
                estatisticas_categorias.append({
                    'categoria': categoria.to_dict(),
                    'total_produtos': len(produtos),
                    'produtos_disponiveis': len([p for p in produtos if p.disponivel])
                })

            return {
                'total_categorias': total_categorias,
                'categorias_detalhes': estatisticas_categorias
            }
        except Exception as e:
            raise Exception(f"Erro ao obter estatísticas: {str(e)}")
