
# 📦 API de Movimentações de Estoque

## Visão Geral
Gerencia todas as movimentações de entrada e saída de produtos do estoque. Todas as rotas exigem autenticação via Bearer Token.

## Base URL
```
http://localhost:3000/api/movements
```

## Autenticação
Todas as requisições devem incluir o header:
```
Authorization: Bearer {seu_token_jwt}
```

---

## Endpoints

### 1. Registrar Entrada de Estoque
`POST /api/movements/entry`

Registra a chegada de produtos ao estoque (compras, devoluções, etc).

**Body:**
```json
{
  "productId": "uuid-do-produto",
  "quantity": 10,
  "unitPrice": 25.90,
  "referenceId": "NF-12345",
  "referenceType": "INVOICE",
  "notes": "Compra de fornecedor"
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Entrada de estoque registrada com sucesso",
  "data": {
    "movement": {
      "id": "uuid",
      "productId": "uuid-do-produto",
      "type": "IN",
      "quantity": 10,
      "previousStock": 10,
      "currentStock": 20,
      "unitPrice": 25.90,
      "totalPrice": 259.00,
      "referenceId": "NF-12345",
      "referenceType": "INVOICE",
      "notes": "Compra de fornecedor",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "product": {
      "id": "uuid",
      "name": "Produto Teste",
      "code": "TEST001",
      "stockQuantity": 20,
      "category": {
        "id": "uuid",
        "name": "Categoria"
      }
    }
  }
}
```

---

### 2. Registrar Saída de Estoque
`POST /api/movements/exit`

Registra a retirada de produtos do estoque (vendas, consumo, etc).

**Body:**
```json
{
  "productId": "uuid-do-produto",
  "quantity": 3,
  "unitPrice": 29.90,
  "referenceId": "PED-001",
  "referenceType": "ORDER",
  "notes": "Venda cliente"
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Saída de estoque registrada com sucesso",
  "data": {
    "movement": {
      "id": "uuid",
      "productId": "uuid-do-produto",
      "type": "OUT",
      "quantity": 3,
      "previousStock": 20,
      "currentStock": 17,
      "unitPrice": 29.90,
      "totalPrice": 89.70,
      "referenceId": "PED-001",
      "referenceType": "ORDER",
      "notes": "Venda cliente",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "product": {
      "id": "uuid",
      "name": "Produto Teste",
      "code": "TEST001",
      "stockQuantity": 17,
      "category": {
        "id": "uuid",
        "name": "Categoria"
      }
    }
  }
}
```

**Resposta de Erro (400) - Estoque insuficiente:**
```json
{
  "success": false,
  "error": "Estoque insuficiente",
  "message": "Estoque atual (10) é insuficiente para a saída de 15 unidades"
}
```

---

### 3. Ajuste Manual de Estoque
`POST /api/movements/adjustment`

Corrige o estoque manualmente (após inventário, por exemplo).

**Permissão:** `admin`, `manager`

**Body:**
```json
{
  "productId": "uuid-do-produto",
  "newStock": 15,
  "notes": "Ajuste após inventário"
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Ajuste de estoque realizado com sucesso",
  "data": {
    "movement": {
      "id": "uuid",
      "productId": "uuid-do-produto",
      "type": "ADJUSTMENT",
      "quantity": 2,
      "previousStock": 17,
      "currentStock": 15,
      "notes": "Ajuste após inventário",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "product": {
      "id": "uuid",
      "name": "Produto Teste",
      "code": "TEST001",
      "previousStock": 17,
      "newStock": 15,
      "difference": -2
    }
  }
}
```

---

### 4. Histórico por Produto
`GET /api/movements/product/:productId`

Retorna todas as movimentações de um produto específico.

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição | Padrão |
|-----------|------|-------------|-----------|--------|
| page | integer | Não | Número da página | 1 |
| limit | integer | Não | Itens por página | 50 |

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid",
      "name": "Produto Teste",
      "code": "TEST001",
      "currentStock": 15
    },
    "movements": [
      {
        "id": "uuid",
        "type": "IN",
        "quantity": 10,
        "previousStock": 5,
        "currentStock": 15,
        "unitPrice": 25.90,
        "totalPrice": 259.00,
        "referenceId": "NF-12345",
        "referenceType": "INVOICE",
        "notes": "Compra",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "user": {
          "id": "uuid",
          "name": "Admin",
          "email": "admin@email.com"
        }
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 50,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

### 5. Últimas Movimentações
`GET /api/movements/recent`

Retorna as últimas movimentações do sistema.

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição | Padrão |
|-----------|------|-------------|-----------|--------|
| limit | integer | Não | Número de registros | 20 |

---

### 6. Resumo por Período
`GET /api/movements/summary`

Retorna um resumo das movimentações em um período.

**Permissão:** `admin`, `manager`

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| startDate | date | Não | Data inicial (YYYY-MM-DD) |
| endDate | date | Não | Data final (YYYY-MM-DD) |

---

## Exemplos de Uso com curl

### Entrada de Estoque
```bash
curl -X POST http://localhost:3000/api/movements/entry \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "uuid-do-produto",
    "quantity": 10,
    "unitPrice": 25.90,
    "referenceId": "NF-12345",
    "notes": "Compra de fornecedor"
  }'
```

### Saída de Estoque
```bash
curl -X POST http://localhost:3000/api/movements/exit \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "uuid-do-produto",
    "quantity": 3,
    "unitPrice": 29.90,
    "referenceId": "PED-001",
    "notes": "Venda cliente"
  }'
```

### Ajuste de Estoque
```bash
curl -X POST http://localhost:3000/api/movements/adjustment \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "uuid-do-produto",
    "newStock": 15,
    "notes": "Ajuste após inventário"
  }'
```

### Histórico por Produto
```bash
curl -X GET "http://localhost:3000/api/movements/product/uuid-do-produto?page=1&limit=10" \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## Códigos de Status

| Código | Descrição |
|--------|-----------|
| 201 | Movimentação registrada com sucesso |
| 400 | Erro de validação ou estoque insuficiente |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Produto não encontrado |
| 500 | Erro interno do servidor |
