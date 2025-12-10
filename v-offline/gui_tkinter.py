# gui_tkinter.py
import tkinter as tk
from tkinter import ttk, messagebox
from auth_module import register_user, login_user, verify_token
from lanchonete_atualizado import mostrarMenu, adicionarPedido, buscarClientes, criarCliente

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title('Lanchonete - GUI')
        self.geometry('700x450')
        self.token = None
        self.user = None
        self._build_login()

    def _build_login(self):
        for w in self.winfo_children():
            w.destroy()
        frame = ttk.Frame(self, padding=20)
        frame.pack(expand=True)
        ttk.Label(frame, text='Username').grid(row=0, column=0)
        self.user_entry = ttk.Entry(frame)
        self.user_entry.grid(row=0, column=1)
        ttk.Label(frame, text='Senha').grid(row=1, column=0)
        self.pass_entry = ttk.Entry(frame, show='*')
        self.pass_entry.grid(row=1, column=1)
        ttk.Button(frame, text='Login', command=self.login).grid(row=2, column=0)
        ttk.Button(frame, text='Registrar', command=self.register).grid(row=2, column=1)

    def login(self):
        username = self.user_entry.get()
        senha = self.pass_entry.get()
        user = login_user(username, senha)
        if user:
            self.user = user
            self.token = user.get('token')
            self._build_panel(user)
        else:
            messagebox.showerror('Erro', 'Credenciais inválidas')

    def register(self):
        username = self.user_entry.get()
        senha = self.pass_entry.get()
        if register_user(username, senha):
            messagebox.showinfo('Sucesso', 'Usuário registrado')
        else:
            messagebox.showerror('Erro', 'Não foi possível registrar')

    def _build_panel(self, user):
        for w in self.winfo_children():
            w.destroy()
        frame = ttk.Frame(self, padding=10)
        frame.pack(fill='both', expand=True)
        ttk.Label(frame, text=f'Bem-vindo {user.get("nome") or user.get("username")}').pack()
        ttk.Button(frame, text='Ver menu', command=lambda: mostrarMenu()).pack(pady=5)
        ttk.Button(frame, text='Fazer pedido', command=self.fazer_pedido).pack(pady=5)
        ttk.Button(frame, text='Sair', command=self._build_login).pack(pady=5)

    def fazer_pedido(self):
        if not self.token or not verify_token(self.token):
            messagebox.showerror('Erro', 'Token inválido. Faça login novamente.')
            return
        win = tk.Toplevel(self)
        ttk.Label(win, text='CPF do cliente').grid(row=0, column=0)
        cpf = ttk.Entry(win); cpf.grid(row=0, column=1)
        ttk.Label(win, text='Mesa id').grid(row=1, column=0)
        mesa = ttk.Entry(win); mesa.grid(row=1, column=1)
        entries = []
        def add_item():
            try:
                idp = int(item_id.get()); q = int(item_q.get()); p = float(item_price.get())
            except:
                messagebox.showerror('Erro', 'Valores inválidos')
                return
            entries.append((idp,q,p))
            item_id.delete(0,'end'); item_q.delete(0,'end'); item_price.delete(0,'end')
        ttk.Label(win, text='idPrato').grid(row=2, column=0); item_id = ttk.Entry(win); item_id.grid(row=2, column=1)
        ttk.Label(win, text='Quantidade').grid(row=2, column=2); item_q = ttk.Entry(win); item_q.grid(row=2, column=3)
        ttk.Label(win, text='Preço').grid(row=2, column=4); item_price = ttk.Entry(win); item_price.grid(row=2, column=5)
        ttk.Button(win, text='Adicionar item', command=add_item).grid(row=2, column=6)
        def enviar():
            cpfv = cpf.get()
            cliente = buscarClientes(cpfv)
            if cliente == []:
                criarCliente(cpfv, 'Cliente', '', '')
            idPedido = adicionarPedido(cpfv, int(mesa.get()), entries)
            messagebox.showinfo('OK', f'Pedido criado: {idPedido}')
            win.destroy()
        ttk.Button(win, text='Enviar pedido', command=enviar).grid(row=4, column=0, columnspan=2)

if __name__ == '__main__':
    app = App()
    app.mainloop()
