# lanchonete_atualizado.py
import mysql.connector
from mysql.connector import Error

def conectaMysql():
    conexao = mysql.connector.connect(
        host = 'localhost',
        user = 'root',
        password = 'Savin1033!',
        database = 'Lanchonete'
    )
    return conexao

# ---------- Função auxiliar: cria as tabelas se não existirem -------------
def ensure_tables():
    """Cria as tabelas básicas caso não existam. Execute uma vez após instalar o servidor."""
    statements = [
        """
        CREATE TABLE IF NOT EXISTS clientes (
            cpf VARCHAR(12) NOT NULL PRIMARY KEY,
            nome VARCHAR(45) NOT NULL,
            telefone VARCHAR(45) NOT NULL,
            email VARCHAR(80) NOT NULL
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS ingredientes (
            idIngrediente INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            nomeIngrediente VARCHAR(45) NOT NULL,
            quantIngrediente VARCHAR(45) NOT NULL,
            unidadeMedida VARCHAR(45) NOT NULL,
            dataValidade VARCHAR(80) NOT NULL
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS pratos (
            idPrato INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            nomePrato VARCHAR(45) NOT NULL,
            listaIngredientes VARCHAR(255) NOT NULL
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS mesas (
            idMesa INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            capacidadeMesa INT NOT NULL,
            statusMesa BOOLEAN NOT NULL,
            horario VARCHAR(45) NOT NULL
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS pedidos (
            idPedido INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            cpfCliente VARCHAR(12) NOT NULL,
            idMesa INT NOT NULL,
            dataHora DATETIME NOT NULL,
            total DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (cpfCliente) REFERENCES clientes(cpf) ON DELETE CASCADE,
            FOREIGN KEY (idMesa) REFERENCES mesas(idMesa) ON DELETE CASCADE
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS itensPedido (
            idItem INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            idPedido INT NOT NULL,
            idPrato INT NOT NULL,
            quantidade INT NOT NULL,
            preco DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (idPedido) REFERENCES pedidos(idPedido) ON DELETE CASCADE,
            FOREIGN KEY (idPrato) REFERENCES pratos(idPrato) ON DELETE CASCADE
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS usuarios (
            idUsuario INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            senha_hash VARCHAR(255) NOT NULL,
            nome VARCHAR(80)
        )
        """
    ]

    try:
        conn = conectaMysql()
        cursor = conn.cursor()
        for s in statements:
            cursor.execute(s)
        conn.commit()
        cursor.close()
        conn.close()
        print("ensure_tables: tabelas verificadas/criadas com sucesso.")
    except Error as e:
        print("ensure_tables: erro ao criar/verificar tabelas:", e)


# --------------------- mostrar menu --------------------------------
def mostrarMenu():
    retorno = []
    try:
        conexao = conectaMysql()
        try:
            cursor = conexao.cursor()
            query = 'SELECT * FROM pratos'
            try:
                cursor.execute(query)
                retorno = cursor.fetchall()
                if not retorno:
                    print("Nenhum prato cadastrado.")
                for instancia in retorno:
                    # instancia é uma tupla (idPrato, nomePrato, listaIngredientes)
                    print(instancia[0], ' - ', instancia[1])
                    lista = instancia[2].split(';') if instancia[2] else []
                    for item in lista:
                        item = item.strip()
                        if item:
                            print('          -', item)
                    print('\n')
            except Error as erro:
                print(f"Erro na busca de pratos: '{erro}' (tabela 'pratos' pode não existir)")
            cursor.close()
        except Error as erro:
            print(f"Erro no cursor: '{erro}'")
        conexao.close()
    except Error as erro:
        print(f"Erro na conexão com o bd: '{erro}'")
    return retorno

# --------------------- Clientes -------------------------------------
def buscarClientes(cpf):
    retorno = []
    try:
        conexao = conectaMysql()
        try:
            cursor = conexao.cursor()
            query = 'SELECT * FROM clientes WHERE cpf = %s'
            try:
                cursor.execute(query, [cpf])
                retorno = cursor.fetchall()
            except Error as erro:
                print(f"Erro na busca de cliente: '{erro}'")
            cursor.close()
        except Error as erro:
            print(f"Erro no cursor: '{erro}'")
        conexao.close()
    except Error as erro:
        print(f"Erro na conexão com o bd: '{erro}'")
    return retorno

def criarCliente(cpf, nomeCliente, telefoneCliente, emailCliente):
    retorno = buscarClientes(cpf)
    if len(cpf) < 11:
        print("CPF inválido (menos de 11 caracteres).")
        return False
    if retorno != []:
        print("Cliente já existe.")
        return False
    try:
        conexao = conectaMysql()
        cursor = conexao.cursor()
        query = 'INSERT INTO clientes (cpf, nome, telefone, email) VALUES (%s, %s, %s, %s)'
        cursor.execute(query, [cpf, nomeCliente, telefoneCliente, emailCliente])
        conexao.commit()
        cursor.close()
        conexao.close()
        return True
    except Error as erro:
        print(f"Erro na inserção de cliente: '{erro}'")
        return False

# editarCliente, removerClientes mantidos (sem alterações funcionais)
def editarCliente(cpf, nome, telefone, email):
    retorno = []
    try:
        conexao = conectaMysql()
        try:
            cursor = conexao.cursor()
            query = 'SELECT * FROM clientes WHERE cpf = %s'
            try:
                cursor.execute(query, [cpf])
                retorno = cursor.fetchall()
                if retorno != []:
                    cursor.close()
                    cursor = conexao.cursor()
                    query = ('UPDATE clientes SET email = %s, telefone = %s, nome = %s WHERE cpf = %s')
                    cursor.execute(query, [email, telefone, nome, cpf])
            except Error as erro:
                print(f"Erro na edição '{erro}'")
            cursor.close()
        except Error as erro:
            print(f"Erro no cursor: '{erro}'")
        conexao.commit()
        conexao.close()
    except Error as erro:
        print(f"Erro na conexão com o bd: '{erro}'")
    return retorno

def removerClientes(cpf):
    retorno = buscarClientes(cpf)
    if retorno != []:
        try:
            conexao = conectaMysql()
            cursor = conexao.cursor()
            query = 'DELETE FROM clientes WHERE cpf = %s'
            cursor.execute(query, [retorno[0][0]])
            conexao.commit()
            cursor.close()
            conexao.close()
            return True
        except Error as erro:
            print(f"Erro na remoção de cliente: '{erro}'")
            return False
    return False

# --------------------- Mesas ---------------------------------------
def buscarMesa(idMesa):
    retorno = []
    try:
        conexao = conectaMysql()
        cursor = conexao.cursor()
        query = 'SELECT * FROM mesas WHERE idMesa = %s'
        cursor.execute(query, [idMesa])
        retorno = cursor.fetchall()
        cursor.close()
        conexao.close()
    except Error as erro:
        print(f"Erro na busca de mesa: '{erro}'")
    return retorno

def adicionarMesa(idMesa, capacidadeMesa, statusMesa, horario):
    retorno = buscarMesa(idMesa)
    if retorno == []:
        try:
            conexao = conectaMysql()
            cursor = conexao.cursor()
            query = 'INSERT INTO mesas (idMesa, capacidadeMesa, statusMesa, horario) VALUES (%s, %s, %s, %s)'
            cursor.execute(query, [idMesa, capacidadeMesa, statusMesa, horario])
            conexao.commit()
            cursor.close()
            conexao.close()
            return True
        except Error as erro:
            print(f"Erro na inserção de mesa: '{erro}'")
            return False
    else:
        print("Mesa já existe.")
        return False

def editarMesa(idMesa, capacidadeMesa, statusMesa, horario):
    retorno = []
    try:
        conexao = conectaMysql()
        cursor = conexao.cursor()
        query = 'SELECT * FROM mesas WHERE idMesa = %s'
        cursor.execute(query, [idMesa])
        retorno = cursor.fetchall()
        if retorno != []:
            query = 'UPDATE mesas SET capacidadeMesa = %s, statusMesa = %s, horario = %s WHERE idMesa = %s'
            cursor.execute(query, [capacidadeMesa, statusMesa, horario, idMesa])
            conexao.commit()
        cursor.close()
        conexao.close()
    except Error as erro:
        print(f"Erro na edição de mesa: '{erro}'")
    return retorno

def reservarMesa(idMesa, horarioMesa, quantClientes):
    retorno = buscarMesa(idMesa)
    if retorno != []:
        # retorno[0] exemplo: (idMesa, capacidadeMesa, statusMesa, horario)
        capacidade = int(retorno[0][1])
        status = bool(retorno[0][2])
        if status is True and quantClientes <= capacidade:
            editarMesa(idMesa, capacidade, False, horarioMesa)
            return True
        else:
            return False
    else:
        return False

def desoculparMesa(idMesa):
    retorno = buscarMesa(idMesa)
    if retorno != []:
        if retorno[0][2] is False:
            editarMesa(idMesa, retorno[0][1], True, '')
            return True
    return False

# --------------------- Ingredientes --------------------------------
def buscarIngredientes(idIngredientes):
    retorno = []
    try:
        conexao = conectaMysql()
        cursor = conexao.cursor()
        query = 'SELECT * FROM ingredientes WHERE idIngrediente = %s'
        cursor.execute(query, [idIngredientes])
        retorno = cursor.fetchall()
        cursor.close()
        conexao.close()
    except Error as erro:
        print(f"Erro na busca de ingrediente: '{erro}'")
    return retorno

def adicionarIngredientes(idIngrediente, nomeIngrediente, quantIngrediente, unidadeMedida, dataValidade):
    retorno = buscarIngredientes(idIngrediente)
    if retorno == []:
        try:
            conexao = conectaMysql()
            cursor = conexao.cursor()
            query = ('INSERT INTO ingredientes (idIngrediente, nomeIngrediente, quantIngrediente, unidadeMedida, dataValidade)'
                     ' VALUES (%s, %s, %s, %s, %s)')
            cursor.execute(query, [idIngrediente, nomeIngrediente, quantIngrediente, unidadeMedida, dataValidade])
            conexao.commit()
            cursor.close()
            conexao.close()
            return True
        except Error as erro:
            print(f"Erro na inserção de ingrediente: '{erro}'")
            return False
    return False

def atualizarIngrediente(idIngrediente, nomeIngrediente, quantIngrediente, unidadeMedida, dataValidade):
    retorno = []
    try:
        conexao = conectaMysql()
        cursor = conexao.cursor()
        query = 'SELECT * FROM ingredientes WHERE idIngrediente = %s'
        cursor.execute(query, [idIngrediente])
        retorno = cursor.fetchall()
        if retorno != []:
            query = ('UPDATE ingredientes SET nomeIngrediente = %s, quantIngrediente = %s, unidadeMedida = %s, dataValidade = %s'
                     ' WHERE idIngrediente = %s')
            cursor.execute(query, [nomeIngrediente, quantIngrediente, unidadeMedida, dataValidade, idIngrediente])
            conexao.commit()
        cursor.close()
        conexao.close()
    except Error as erro:
        print(f"Erro na atualização de ingrediente: '{erro}'")
    return retorno

def removerIngredientes(idIngrediente):
    retorno = buscarIngredientes(idIngrediente)
    if retorno != []:
        try:
            conexao = conectaMysql()
            cursor = conexao.cursor()
            query = 'DELETE FROM ingredientes WHERE idIngrediente = %s'
            cursor.execute(query, [retorno[0][0]])
            conexao.commit()
            cursor.close()
            conexao.close()
            return True
        except Error as erro:
            print(f"Erro na remoção de ingrediente: '{erro}'")
            return False
    return False

# --------------------- Pratos ---------------------------------------
def buscarPrato(idPrato):
    retorno = []
    try:
        conexao = conectaMysql()
        cursor = conexao.cursor()
        query = 'SELECT * FROM pratos WHERE idPrato = %s'
        cursor.execute(query, [idPrato])
        retorno = cursor.fetchall()
        cursor.close()
        conexao.close()
    except Error as erro:
        print(f"Erro na busca de prato: '{erro}'")
    return retorno

def adicionarPrato(idPrato, nomePrato, listaIngredientes):
    retorno = buscarPrato(idPrato)
    if retorno == []:
        num = 0
        ingredientes = listaIngredientes.split(' ')
        lista_str = ''
        for i in range(len(ingredientes)):
            if i % 2 == 0:
                ingrediente = buscarIngredientes(ingredientes[i])
                if ingrediente != []:
                    lista_str = lista_str + ingrediente[0][1] + ' - ' + ingredientes[i + 1] + ';'
                    num += 1
        if (len(ingredientes) // 2) == num:
            try:
                conexao = conectaMysql()
                cursor = conexao.cursor()
                query = ('INSERT INTO pratos (idPrato, nomePrato, listaIngredientes)'
                         ' VALUES (%s, %s, %s)')
                cursor.execute(query, [idPrato, nomePrato, lista_str])
                conexao.commit()
                cursor.close()
                conexao.close()
                return True
            except Error as erro:
                print(f"Erro na inserção de prato: '{erro}'")
                return False
    return False

def alteraPrato(idPrato, nomePrato, listaIngredientes):
    retorno = []
    try:
        conexao = conectaMysql()
        cursor = conexao.cursor()
        query = 'SELECT * FROM pratos WHERE idPrato = %s'
        cursor.execute(query, [idPrato])
        retorno = cursor.fetchall()
        if retorno != []:
            num = 0
            ingredientes = listaIngredientes.split(' ')
            lista_str = ''
            for i in range(len(ingredientes)):
                if i % 2 == 0:
                    ingrediente = buscarIngredientes(ingredientes[i])
                    if ingrediente != []:
                        lista_str = lista_str + ingrediente[0][1] + ' - ' + ingredientes[i + 1] + ';'
                        num += 1
            if (len(ingredientes) // 2) == num:
                query = ('UPDATE pratos SET nomePrato = %s, listaIngredientes = %s WHERE idPrato = %s')
                cursor.execute(query, [nomePrato, lista_str, idPrato])
                conexao.commit()
            else:
                retorno = []
        cursor.close()
        conexao.close()
    except Error as erro:
        print(f"Erro na edição de prato: '{erro}'")
    return retorno

def removerPratos(idPrato):
    retorno = buscarPrato(idPrato)
    if retorno != []:
        try:
            conexao = conectaMysql()
            cursor = conexao.cursor()
            query = 'DELETE FROM pratos WHERE idPrato = %s'
            cursor.execute(query, [retorno[0][0]])
            conexao.commit()
            cursor.close()
            conexao.close()
            return True
        except Error as erro:
            print(f"Erro na remoção de prato: '{erro}'")
            return False
    return False

# --------------------- Pedidos -------------------------------------
def adicionarPedido(cpfCliente, idMesa, itens):
    try:
        conexao = conectaMysql()
        cursor = conexao.cursor()

        query = "INSERT INTO pedidos (cpfCliente, idMesa, dataHora, total) VALUES (%s, %s, NOW(), 0)"
        cursor.execute(query, [cpfCliente, idMesa])
        idPedido = cursor.lastrowid

        total = 0

        for prato, quantidade, preco in itens:
            query = "INSERT INTO itensPedido (idPedido, idPrato, quantidade, preco) VALUES (%s, %s, %s, %s)"
            cursor.execute(query, [idPedido, prato, quantidade, preco])
            total += quantidade * float(preco)

        query = "UPDATE pedidos SET total = %s WHERE idPedido = %s"
        cursor.execute(query, [total, idPedido])

        conexao.commit()
        cursor.close()
        conexao.close()

        return idPedido

    except Error as erro:
        print("Erro ao adicionar pedido:", erro)
        return None

def buscarPedido(idPedido):
    try:
        conexao = conectaMysql()
        cursor = conexao.cursor()

        query = """
        SELECT p.idPedido, p.cpfCliente, p.idMesa, p.dataHora, p.total,
               i.idPrato, i.quantidade, i.preco
        FROM pedidos p
        JOIN itensPedido i ON p.idPedido = i.idPedido
        WHERE p.idPedido = %s
        """

        cursor.execute(query, [idPedido])
        retorno = cursor.fetchall()

        cursor.close()
        conexao.close()
        return retorno

    except Error as erro:
        print("Erro ao buscar pedido:", erro)
        return []

def removerPedido(idPedido):
    try:
        conexao = conectaMysql()
        cursor = conexao.cursor()

        cursor.execute("DELETE FROM itensPedido WHERE idPedido = %s", [idPedido])
        cursor.execute("DELETE FROM pedidos WHERE idPedido = %s", [idPedido])

        conexao.commit()

        cursor.close()
        conexao.close()
        return True

    except Error as erro:
        print("Erro ao remover pedido:", erro)
        return False
