# terminal_interface.py
import getpass
from auth_module import register_user, login_user, verify_token
from lanchonete_atualizado import mostrarMenu, adicionarPedido, reservarMesa
from lanchonete_atualizado import buscarClientes, criarCliente

def menu_principal():
    print('=== Lanchonete - Terminal ===')
    print('1. Registrar usuário')
    print('2. Login')
    print('3. Sair')
    return input('> ')

def painel_usuario(username, token):
    print(f'Bem-vindo, {username}')
    while True:
        print('\n1. Ver menu')
        print('2. Fazer pedido')
        print('3. Reservar mesa')
        print('4. Sair')
        c = input('> ')
        if c == '1':
            mostrarMenu()

        elif c == '2':
            user_validado = verify_token(token)
            if not user_validado:
                print('Token inválido. Faça login novamente.')
                break

            cpf = input('CPF do cliente: ')
            cliente = buscarClientes(cpf)
            if cliente == []:
                nome = input('Nome: ')
                telefone = input('Telefone: ')
                email = input('Email: ')
                criarCliente(cpf, nome, telefone, email)

            idMesa = int(input('ID da mesa: '))

            itens = []
            while True:
                idPrato = int(input('ID do prato (0 para sair): '))
                if idPrato == 0:
                    break
                qtd = int(input('Quantidade: '))
                preco = float(input('Preço: '))
                itens.append((idPrato, qtd, preco))

            pid = adicionarPedido(cpf, idMesa, itens)
            print("Pedido criado! ID:", pid)

        elif c == '3':
            user_validado = verify_token(token)
            if not user_validado:
                print('Token inválido.')
                break

            idMesa = int(input('ID da mesa: '))
            horario = input('Horário (YYYY-MM-DD HH:MM): ')
            qtd = int(input('Quantidade de pessoas: '))

            r = reservarMesa(idMesa, horario, qtd)
            if r != []:
                print("Mesa reservada!")
            else:
                print("Não foi possível reservar.")

        elif c == '4':
            break

def main():
    while True:
        c = menu_principal()
        if c == '1':
            user = input('Usuário: ')
            senha = getpass.getpass('Senha: ')
            nome = input('Nome (opcional): ')
            ok = register_user(user, senha, nome)
            print("Usuário criado!" if ok else "Erro ao criar usuário.")

        elif c == '2':
            user = input('Usuário: ')
            senha = getpass.getpass('Senha: ')
            token = login_user(user, senha)

            if token:
                nome = verify_token(token)
                painel_usuario(nome, token)
            else:
                print('Credenciais incorretas.')

        elif c == '3':
            break

if __name__ == '__main__':
    main()
