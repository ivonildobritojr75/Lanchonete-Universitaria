-- Script de seed para inserir dados iniciais no banco
-- Este arquivo contém os dados mocados que estavam no frontend

-- Inserir categorias
INSERT
    OR IGNORE INTO categorias (nome, descricao)
VALUES (
        'Sucos',
        'Bebidas refrescantes à base de frutas'
    ),
    (
        'Lanches',
        'Pratos principais e sanduíches'
    ),
    (
        'Bebidas',
        'Refrigerantes e outras bebidas'
    ),
    (
        'Salgados',
        'Salgados diversos'
    ),
    (
        'Acompanhamentos',
        'Acompanhamentos para os pratos'
    );

-- Inserir produtos
INSERT
    OR IGNORE INTO produtos (
        nome,
        preco,
        categoria,
        disponivel,
        imagem,
        descricao
    )
VALUES (
        'Suco de Acerola',
        2.00,
        'Sucos',
        1,
        '/assets/Menu/Suco_Acerola.jpg',
        'Delicioso suco natural de acerola'
    ),
    (
        'Suco de Manga',
        2.00,
        'Sucos',
        1,
        '/assets/Menu/Suco_Manga.jpg',
        'Suco refrescante de manga'
    ),
    (
        'Suco de Laranja',
        2.00,
        'Sucos',
        1,
        '/assets/Menu/Suco_Laranja.jpg',
        'Suco natural de laranja'
    ),
    (
        'Suco de Abacaixa',
        2.00,
        'Sucos',
        1,
        '/assets/Menu/Suco_Abacaxi.jpg',
        'Suco cremoso de abacaxi'
    ),
    (
        'Suco de Maracujá',
        2.00,
        'Sucos',
        0,
        '/assets/Menu/Suco_Maracujá.jpg',
        'Suco refrescante de maracujá'
    ),
    (
        'Mini Pizza',
        5.00,
        'Lanches',
        1,
        '/assets/Menu/Mini_Pizza.jpg',
        'Mini pizza individual com diversos sabores'
    ),
    (
        'Sanduíche Natural',
        5.00,
        'Lanches',
        1,
        '/assets/Menu/Sanduiche.jpg',
        'Sanduíche saudável com ingredientes frescos'
    ),
    (
        'Refrigerante Lata',
        5.00,
        'Bebidas',
        1,
        '/assets/Menu/Refrigerante_Lata.jpg',
        'Refrigerante gelado em lata'
    ),
    (
        'Coxinha de Frango',
        5.00,
        'Salgados',
        1,
        '/assets/Menu/Coxinha.jpg',
        'Coxinha crocante recheada com frango'
    ),
    (
        'Pão de Queijo',
        5.00,
        'Salgados',
        1,
        '/assets/Menu/Pão_Queijo.jpg',
        'Pão de queijo quentinho e macio'
    ),
    (
        'Bomba',
        5.00,
        'Salgados',
        1,
        '🥟',
        'Bomba recheada com diversos sabores'
    ),
    (
        'Pão de Frango',
        5.00,
        'Salgados',
        1,
        '🥟',
        'Pão recheado com frango desfiado'
    ),
    (
        'Empada',
        5.00,
        'Salgados',
        1,
        '🥟',
        'Empada crocante com recheio variado'
    ),
    (
        'Pastel de Carne',
        5.00,
        'Salgados',
        1,
        '/assets/Menu/Pastel_Carne.avif',
        'Pastel frito recheado com carne'
    ),
    (
        'Pastel de Frango',
        5.00,
        'Salgados',
        1,
        '/assets/Menu/Pastel_Flango.jpg',
        'Pastel frito recheado com frango'
    );