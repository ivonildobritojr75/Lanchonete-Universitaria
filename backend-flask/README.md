# API Lanchonete - Backend Flask

Este é um projeto base para uma API REST desenvolvida com Flask para gerenciar uma lanchonete.

## Estrutura do Projeto

```
backend-flask/
├── 📁 app/
│   ├── __init__.py           # Inicialização da aplicação Flask
│   │
│   ├── 📁 models/            # Modelos de dados (SQLAlchemy)
│   │   ├── usuario.py        # Modelo de usuário
│   │   ├── produto.py        # Modelo de produto
│   │   ├── pedido.py         # Modelo de pedido
│   │   ├── categoria.py      # Modelo de categoria
│   │   └── db.py             # Configuração do banco
│   │
│   ├── 📁 repositories/      # Camada de acesso a dados
│   │   ├── usuario_repository.py
│   │   ├── produto_repository.py
│   │   ├── pedido_repository.py
│   │   └── categoria_repository.py
│   │
│   ├── 📁 service/           # Regras de negócio
│   │   ├── usuario_service.py
│   │   ├── produto_service.py
│   │   ├── pedido_service.py
│   │   └── categoria_service.py
│   │
│   ├── 📁 routes/            # Rotas da API
│   │   ├── auth.py           # Rotas de autenticação
│   │   ├── usuarios.py       # Rotas de usuários
│   │   ├── produtos.py       # Rotas de produtos
│   │   ├── pedidos.py        # Rotas de pedidos
│   │   ├── categorias.py     # Rotas de categorias
│   │   └── init.py           # Inicialização das rotas
│   │
│   └── 📁 utils/             # Utilitários
│       └── jwt_utils.py      # Funções JWT
│
├── 📁 database/              # Scripts do banco de dados
│   ├── schema.sql            # Schema do banco
│   ├── seed.sql              # Dados iniciais
│   └── db.sqlite3            # Banco SQLite
│
├── run.py                    # Ponto de entrada da aplicação
├── requirements.txt          # Dependências Python
├── seed.py                   # Script de população do banco
└── README.md                 # Documentação do backend
```

## Instalação

1. **Clone ou navegue até o diretório do projeto**

2. **Crie um ambiente virtual (recomendado):**

   ```bash
   python -m venv venv
   # No Windows:
   venv\Scripts\activate
   # No Linux/Mac:
   source venv/bin/activate
   ```

3. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

## Executando o Servidor

### Opção 1: Usando o script run.py

```bash
python run.py
```

### Opção 2: Usando Flask diretamente

```bash
# Defina a variável de ambiente FLASK_APP
export FLASK_APP=run.py
# ou no Windows:
set FLASK_APP=run.py

# Execute
flask run
```

O servidor será iniciado em `http://localhost:5000`

## Endpoints Disponíveis

- `GET /api/` - Página inicial da API
- `GET /api/health` - Verificação de saúde da API
- `GET /api/echo/<mensagem>` - Echo de mensagem
- `POST /api/test` - Teste de envio de dados JSON

### Exemplos de Uso

```bash
# Verificar saúde da API
curl http://localhost:5000/api/health

# Echo de mensagem
curl http://localhost:5000/api/echo/OlaMundo

# Teste POST
curl -X POST http://localhost:5000/api/test \
  -H "Content-Type: application/json" \
  -d '{"nome": "João", "pedido": "hamburger"}'
```

## Configuração

As configurações podem ser alteradas no arquivo `config.py` ou através de variáveis de ambiente:

- `SECRET_KEY`: Chave secreta da aplicação
- `DEBUG`: Modo debug (True/False)
- `HOST`: Host do servidor (padrão: 0.0.0.0)
- `PORT`: Porta do servidor (padrão: 5000)

## Próximos Passos

- Implementar autenticação JWT
- Adicionar banco de dados (SQLite/PostgreSQL)
- Criar modelos para produtos, pedidos, usuários
- Implementar CRUD completo para entidades
- Adicionar validação de dados
- Criar documentação Swagger/OpenAPI

## Tecnologias Utilizadas

- **Flask**: Framework web Python
- **Flask-CORS**: Suporte a CORS
- **python-dotenv**: Carregamento de variáveis de ambiente
