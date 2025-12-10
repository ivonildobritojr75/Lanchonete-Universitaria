from app.models.produto import Produto
from app.repositories.produto_repository import ProdutoRepository
from app.repositories.categoria_repository import CategoriaRepository
from werkzeug.utils import secure_filename
import os
import uuid


class ProdutoService:
    """Serviço de lógica de negócio para produtos"""

    @staticmethod
    def criar_produto(dados):
        """Cria um novo produto com validações de negócio"""
        try:
            # Verificar se categoria existe
            if dados.get('categoria'):
                categoria = CategoriaRepository.buscar_por_nome(dados['categoria'])
                if not categoria:
                    # Se não existe, criar categoria automaticamente
                    nova_categoria = Categoria(
                        nome=dados['categoria'],
                        descricao=f"Categoria {dados['categoria']}"
                    )
                    nova_categoria.validar()
                    CategoriaRepository.criar(nova_categoria)

            # Criar objeto Produto
            produto = Produto(
                nome=dados.get('nome'),
                preco=dados.get('preco'),
                categoria=dados.get('categoria'),
                disponivel=dados.get('disponivel', True),
                imagem=dados.get('imagem'),
                descricao=dados.get('descricao')
            )

            # Validar dados
            produto.validar()

            # Salvar no banco
            produto_criado = ProdutoRepository.criar(produto)

            # Retornar dados
            return produto_criado.to_dict()

        except ValueError as e:
            raise ValueError(f"Erro de validação: {str(e)}")
        except Exception as e:
            raise Exception(f"Erro ao criar produto: {str(e)}")

    @staticmethod
    def buscar_produto_por_id(produto_id):
        """Busca um produto por ID"""
        try:
            produto = ProdutoRepository.buscar_por_id(produto_id)
            if not produto:
                raise ValueError("Produto não encontrado")

            return produto.to_dict()
        except Exception as e:
            raise Exception(f"Erro ao buscar produto: {str(e)}")

    @staticmethod
    def listar_produtos(disponiveis_apenas=False, categoria=None, busca=None):
        """Lista produtos com filtros opcionais"""
        try:
            if categoria:
                # Buscar por categoria específica
                produtos = ProdutoRepository.buscar_por_categoria(categoria)
            elif busca:
                # Buscar por termo
                produtos = ProdutoRepository.buscar_por_nome_parcial(busca)
            else:
                # Listar todos
                produtos = ProdutoRepository.listar_todos(disponiveis_apenas)

            return {
                'produtos': [produto.to_dict() for produto in produtos],
                'total': len(produtos)
            }
        except Exception as e:
            raise Exception(f"Erro ao listar produtos: {str(e)}")

    @staticmethod
    def atualizar_produto(produto_id, dados):
        """Atualiza dados de um produto"""
        try:
            # Verificar campos permitidos
            campos_permitidos = ['nome', 'preco', 'categoria', 'disponivel',
                               'imagem', 'descricao']
            campos_para_atualizar = {}

            for campo in campos_permitidos:
                if campo in dados:
                    campos_para_atualizar[campo] = dados[campo]

            if not campos_para_atualizar:
                raise ValueError("Nenhum campo válido para atualizar")

            # Se categoria foi alterada, verificar se existe
            if 'categoria' in campos_para_atualizar:
                categoria = CategoriaRepository.buscar_por_nome(campos_para_atualizar['categoria'])
                if not categoria:
                    # Criar categoria se não existir
                    nova_categoria = Categoria(
                        nome=campos_para_atualizar['categoria'],
                        descricao=f"Categoria {campos_para_atualizar['categoria']}"
                    )
                    nova_categoria.validar()
                    CategoriaRepository.criar(nova_categoria)

            # Atualizar no banco
            produto_atualizado = ProdutoRepository.atualizar(produto_id, **campos_para_atualizar)

            return produto_atualizado.to_dict()

        except ValueError as e:
            raise ValueError(f"Erro de validação: {str(e)}")
        except Exception as e:
            raise Exception(f"Erro ao atualizar produto: {str(e)}")

    @staticmethod
    def deletar_produto(produto_id, permanente=False):
        """Remove um produto"""
        try:
            if permanente:
                ProdutoRepository.deletar_permanentemente(produto_id)
                return {"mensagem": "Produto removido permanentemente"}
            else:
                ProdutoRepository.deletar(produto_id)
                return {"mensagem": "Produto marcado como indisponível"}
        except ValueError as e:
            raise ValueError(str(e))
        except Exception as e:
            raise Exception(f"Erro ao deletar produto: {str(e)}")

    @staticmethod
    def obter_estatisticas():
        """Obtém estatísticas dos produtos"""
        try:
            total_produtos = ProdutoRepository.contar_produtos()
            produtos_disponiveis = len(ProdutoRepository.listar_todos(True))
            produtos_indisponiveis = total_produtos - produtos_disponiveis

            # Contar por categoria
            todos_produtos = ProdutoRepository.listar_todos()
            categorias_count = {}
            for produto in todos_produtos:
                categoria = produto.categoria
                if categoria in categorias_count:
                    categorias_count[categoria] += 1
                else:
                    categorias_count[categoria] = 1

            return {
                'total_produtos': total_produtos,
                'produtos_disponiveis': produtos_disponiveis,
                'produtos_indisponiveis': produtos_indisponiveis,
                'categorias': categorias_count
            }
        except Exception as e:
            raise Exception(f"Erro ao obter estatísticas: {str(e)}")

    @staticmethod
    def listar_categorias():
        """Lista todas as categorias disponíveis"""
        try:
            categorias = CategoriaRepository.listar_todas()
            return {
                'categorias': [categoria.to_dict() for categoria in categorias],
                'total': len(categorias)
            }
        except Exception as e:
            raise Exception(f"Erro ao listar categorias: {str(e)}")

    @staticmethod
    def salvar_imagem_produto(arquivo):
        """Salva a imagem do produto na pasta do frontend"""
        try:
            # Verificar se o arquivo é válido
            if not arquivo or not arquivo.filename:
                raise ValueError("Arquivo de imagem inválido")

            # Verificar extensão do arquivo
            extensoes_permitidas = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'}
            if '.' not in arquivo.filename:
                raise ValueError("Arquivo sem extensão válida")
            extensao = arquivo.filename.rsplit('.', 1)[1].lower()
            if extensao not in extensoes_permitidas:
                raise ValueError("Tipo de arquivo não permitido. Use: png, jpg, jpeg, gif, webp, avif")

            # Criar nome único para o arquivo
            nome_seguro = secure_filename(arquivo.filename)
            nome_unico = f"{uuid.uuid4().hex}_{nome_seguro}"

            # Caminho para a pasta do frontend (assumindo que backend e frontend estão no mesmo diretório pai)
            caminho_frontend = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
                'frontend', 'public', 'assets', 'Menu'
            )

            # Criar diretório se não existir
            os.makedirs(caminho_frontend, exist_ok=True)

            # Caminho completo do arquivo
            caminho_completo = os.path.join(caminho_frontend, nome_unico)

            # Salvar arquivo
            arquivo.save(caminho_completo)

            # Retornar caminho relativo para o frontend
            return f"/assets/Menu/{nome_unico}"

        except Exception as e:
            raise Exception(f"Erro ao salvar imagem: {str(e)}")
