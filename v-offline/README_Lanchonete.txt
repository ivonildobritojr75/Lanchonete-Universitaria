
Arquivos gerados:
- lanchonete.sql (script completo do banco, inclui tabela 'usuarios' para login)
- lanchonete_atualizado.py (seu arquivo original com funções de pedido adicionadas)
- auth_module.py (funções de registro e login, usa hash SHA256)
- terminal_interface.py (app terminal com registro/login e operações)
- gui_tkinter.py (GUI básica com login e criar pedido)
- api_flask.py (API REST simples com endpoints de registro/login/pratos/pedidos)

Como usar:
1) Importe o SQL em seu MySQL Workbench:
   - Rode o arquivo /mnt/data/lanchonete.sql

2) Verifique conexão:
   - Ajuste credenciais no lanchonete_atualizado.py (função conectaMysql)

3) Terminal:
   - python3 /mnt/data/terminal_interface.py

4) GUI:
   - python3 /mnt/data/gui_tkinter.py

5) API:
   - python3 /mnt/data/api_flask.py
   - Endpoints: /register, /login, /pratos, /pedidos

Observações de segurança:
- A senha é hasheada com SHA256 + salt. Ideal usar bcrypt na produção.
- API não tem autenticação de tokens (JWT). Para produção, adicione.

