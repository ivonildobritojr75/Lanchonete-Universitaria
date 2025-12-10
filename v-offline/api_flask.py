# api_flask.py
from flask import Flask, request, jsonify, g
from functools import wraps
from auth_module import register_user, login_user, verify_token
from lanchonete_atualizado import mostrarMenu, adicionarPedido, buscarPedido

app = Flask(__name__)

def require_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization')
        if not auth:
            return jsonify({'error': 'Authorization header missing'}), 401
        parts = auth.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'error': 'Authorization header invalid'}), 401
        token = parts[1]
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Token inválido ou expirado'}), 401
        g.user = payload
        return f(*args, **kwargs)
    return decorated

@app.route('/register', methods=['POST'])
def api_register():
    data = request.json or {}
    ok = register_user(data.get('username'), data.get('password'), data.get('nome'))
    return jsonify({'ok': ok})

@app.route('/login', methods=['POST'])
def api_login():
    data = request.json or {}
    user = login_user(data.get('username'), data.get('password'))
    if user:
        return jsonify({'ok': True, 'user': user})
    return jsonify({'ok': False}), 401

@app.route('/pratos', methods=['GET'])
@require_token
def api_pratos():
    pratos = mostrarMenu()
    return jsonify({'pratos': pratos})

@app.route('/pedidos', methods=['POST'])
@require_token
def api_pedidos():
    data = request.json or {}
    cpf = data.get('cpf')
    idMesa = data.get('idMesa')
    itens = data.get('itens')  # lista de dicts {idPrato, quantidade, preco}
    itens_tupla = [(i['idPrato'], i['quantidade'], i['preco']) for i in itens]
    pedido_id = adicionarPedido(cpf, idMesa, itens_tupla)
    return jsonify({'idPedido': pedido_id})

@app.route('/pedidos/<int:idPedido>', methods=['GET'])
@require_token
def api_get_pedido(idPedido):
    p = buscarPedido(idPedido)
    return jsonify({'pedido': p})

if __name__ == '__main__':
    app.run(debug=True)
