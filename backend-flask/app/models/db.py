import sqlite3
import os
from flask import current_app

# Conexão com o banco de dados
def get_connection(db_path=None):
    if db_path is None:
        db_path = current_app.config['DB_PATH']
    return sqlite3.connect(db_path)

# Inicializa o banco de dados
def init_db(db_path, schema_path, data_path=None):
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

    # Sempre executar o schema para garantir que as tabelas existam
    conn = get_connection(db_path)

    try:
        # Executar schema
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
            conn.executescript(schema_sql)

        # Executar dados iniciais apenas se data_path foi fornecido
        if data_path:
            with open(data_path, 'r', encoding='utf-8') as f:
                conn.executescript(f.read())

        conn.commit()
        return "Banco inicializado com sucesso!"
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()