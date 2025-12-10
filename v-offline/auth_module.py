import bcrypt
import jwt
import mysql.connector
from datetime import datetime, timedelta

SECRET_KEY = "CHAVE_SECRETA_AQUI"

def conectaMysql():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='Savin1033!',
        database='Lanchonete'
    )

# Registrar usuário
def register_user(username, senha, nome):
    try:
        conexao = conectaMysql()
        cursor = conexao.cursor()

        # Criar salt
        salt = bcrypt.gensalt()

        # Criar hash da senha
        senha_hash = bcrypt.hashpw(senha.encode("utf8"), salt)

        sql = """
            INSERT INTO usuarios (username, senha_hash, salt)
            VALUES (%s, %s, %s)
        """
        cursor.execute(sql, (username, senha_hash, salt))

        conexao.commit()
        cursor.close()
        conexao.close()

        return True

    except Exception as e:
        print("Erro ao registrar usuário:", e)
        return False


# Login
def login_user(username, senha):
    try:
        conexao = conectaMysql()
        cursor = conexao.cursor(dictionary=True)

        cursor.execute("SELECT * FROM usuarios WHERE username = %s", (username,))
        user = cursor.fetchone()

        if not user:
            print("Usuário não encontrado.")
            return None

        senha_hash = user["senha_hash"]
        salt = user["salt"]

        # Verificar senha
        if bcrypt.checkpw(senha.encode("utf8"), senha_hash.encode("utf8") if isinstance(senha_hash, str) else senha_hash):
            token = jwt.encode(
                {"user": username, "exp": datetime.utcnow() + timedelta(hours=1)},
                SECRET_KEY,
                algorithm="HS256"
            )
            return token
        else:
            print("Senha incorreta.")
            return None

    except Exception as e:
        print("Erro no login:", e)
        return None


# Verificar token
def verify_token(token):
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded["user"]
    except:
        return None
