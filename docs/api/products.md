# 📦 API de Produtos

## Visão Geral
Gerencia os produtos do estoque. Todas as rotas exigem autenticação via Bearer Token.

## Base URL

http://localhost:3000/api/products


## Autenticação
Todas as requisições devem incluir o header:


---

## Endpoints

### 1. Listar Produtos
`GET /api/products`

Lista produtos com suporte a paginação, filtros e ordenação.

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição | Padrão |
|-----------|------|-------------|-----------|--------|
| page | integer | Não | Número da página | 1 |
| limit | integer | Não | Itens por página (max 100) | 10 |
| category | uuid | Não | Filtrar por ID da categoria | - |
| code | string | Não | Buscar por código (parcial) | - |
| name | string | Não | Buscar por nome (parcial) | - |
| lowStock | boolean | Não | Apenas produtos com estoque baixo | false |
| sortBy | string | Não | Campo de ordenação | name |
| order | string | Não | Direção (ASC/DESC) | ASC |

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Notebook Dell",
        "code": "NOTE001",
        "price": 3500.00,
        "stockQuantity": 10,
        "minStock": 3,
        "maxStock": 100,
        "description": "Notebook Dell Inspiron 15",
        "isActive": true,
        "category": {
          "id": "uuid",
          "name": "Informática",
          "slug": "informatica"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}


2. Buscar Produto por ID

`GET /api/products/:id`

Retorna os detalhes completos de um produto específico.

**Parâmetros de Rota:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| id | uuid | Sim | ID do produto no formato UUID (ex: f47ac10b-58cc-4372-a567-0e02b2c3d479) |

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "name": "Notebook Dell",
    "code": "NOTE001",
    "barcode": "7891234567890",
    "price": 3500.00,
    "costPrice": 2800.00,
    "stockQuantity": 10,
    "minStock": 3,
    "maxStock": 100,
    "location": "A-01-01",
    "description": "Notebook Dell Inspiron 15 com 16GB RAM e SSD 512GB",
    "isActive": true,
    "category": {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "name": "Informática",
      "slug": "informatica"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Resposta de Erro (400) - ID inválido:**
```json
{
  "success": false,
  "error": "Erro de validação",
  "details": [
    {
      "field": "id",
      "message": "ID do produto inválido"
    }
  ]
}
```

**Resposta de Erro (404) - Produto não encontrado:**
```json
{
  "success": false,
  "error": "Produto não encontrado",
  "message": "Nenhum produto encontrado com o ID f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

---

### 3. Buscar Produto por Código
`GET /api/products/code/:code`

Retorna um produto específico pelo seu código único.

**Parâmetros de Rota:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| code | string | Sim | Código do produto (ex: NOTE001) |

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "name": "Notebook Dell",
    "code": "NOTE001",
    "price": 3500.00,
    "stockQuantity": 10,
    "category": {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "name": "Informática",
      "slug": "informatica"
    }
  }
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "error": "Produto não encontrado",
  "message": "Nenhum produto encontrado com o código NOTE001"
}
```

---

### 4. Produtos com Estoque Baixo
`GET /api/products/low-stock`

Retorna produtos onde o estoque atual é menor ou igual ao estoque mínimo.

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição | Padrão |
|-----------|------|-------------|-----------|--------|
| page | integer | Não | Número da página | 1 |
| limit | integer | Não | Itens por página | 10 |

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "name": "Mouse Gamer",
        "code": "MOUSE001",
        "stockQuantity": 2,
        "minStock": 5,
        "price": 89.90,
        "category": {
          "id": "uuid",
          "name": "Informática"
        }
      }
    ],
    "pagination": {
      "total": 3,
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

## Códigos de Status

| Código | Descrição | Quando ocorre |
|--------|-----------|---------------|
| 200 | Sucesso | Requisição processada corretamente |
| 400 | Erro de validação | Parâmetros inválidos (ID mal formatado, página negativa, etc) |
| 401 | Não autenticado | Token JWT ausente ou inválido |
| 404 | Recurso não encontrado | Produto com ID/código especificado não existe |
| 500 | Erro interno do servidor | Erro inesperado no servidor |

---

## Exemplos de Uso

### Listar primeira página com 10 itens
```bash
curl -X GET "http://localhost:3000/api/products?page=1&limit=10" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Buscar produtos da categoria "Informática"
```bash
curl -X GET "http://localhost:3000/api/products?category=f47ac10b-58cc-4372-a567-0e02b2c3d479" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Buscar produto por ID
```bash
curl -X GET "http://localhost:3000/api/products/f47ac10b-58cc-4372-a567-0e02b2c3d479" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Buscar produto por código
```bash
curl -X GET "http://localhost:3000/api/products/code/NOTE001" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Buscar produtos com estoque baixo
```bash
curl -X GET "http://localhost:3000/api/products/low-stock" \
  -H "Authorization: Bearer SEU_TOKEN"