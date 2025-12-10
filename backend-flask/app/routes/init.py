from flask import Blueprint

init_bp = Blueprint('init', __name__)

@init_bp.route('/')
def home():
    return "Aplicação rodando! Banco de dados inicializado automaticamente."