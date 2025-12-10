#!/usr/bin/env python3
"""
Script para executar a seed manualmente no banco de dados.
Execute este script apenas uma vez para popular o banco com dados iniciais.

Como usar:
    python seed.py
"""

import os
import sys
import sqlite3

def run_seed():
    """Executa a seed manualmente"""
    # Obter caminhos
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, 'database', 'db.sqlite3')
    seed_path = os.path.join(script_dir, 'database', 'seed.sql')

    # Verificar se os arquivos existem
    if not os.path.exists(seed_path):
        print(f"❌ Arquivo de seed não encontrado: {seed_path}")
        sys.exit(1)

    try:
        print("Executando seed manualmente...")

        # Conectar ao banco
        conn = sqlite3.connect(db_path)

        # Executar seed
        with open(seed_path, 'r', encoding='utf-8') as f:
            conn.executescript(f.read())

        conn.commit()
        conn.close()

        print("✅ Seed executada com sucesso!")
        print("⚠️  IMPORTANTE: Este script deve ser executado apenas uma vez.")

    except Exception as e:
        print(f"❌ Erro ao executar seed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_seed()
