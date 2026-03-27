## 📍 **ONDE ADICIONAR ESSA DOCUMENTAÇÃO**

Você deve adicionar esses códigos de erro e exemplos no arquivo:

---

## 📁 **docs/regras_negocio/validacoes.md**

Este arquivo já foi criado no DIA 10. Agora vamos **atualizá-lo** com as novas informações.

---

## 📝 **ARQUIVO COMPLETO ATUALIZADO**

**docs/regras_negocio/validacoes.md**:

```markdown
# 🔒 Regras de Validação - Gestão de Estoque

## Visão Geral
Este documento descreve todas as regras de validação aplicadas às operações de estoque do sistema.

---

## Códigos de Erro

| Código | HTTP Status | Descrição |
|--------|-------------|-----------|
| PRODUCT_NOT_FOUND | 404 | Produto não encontrado |
| PRODUCT_INACTIVE | 400 | Produto inativo |
| QUANTITY_REQUIRED | 400 | Quantidade obrigatória |
| INVALID_QUANTITY | 400 | Quantidade inválida (<= 0) |
| QUANTITY_NOT_INTEGER | 400 | Quantidade não é inteira |
| INSUFFICIENT_STOCK | 400 | Estoque insuficiente |
| NEGATIVE_STOCK | 400 | Operação causaria estoque negativo |

---

## Validações de Saída (OUT)

### 1. Validação de Produto
| Regra | Descrição | Erro |
|-------|-----------|------|
| Produto existe | O ID do produto deve existir no sistema | PRODUCT_NOT_FOUND |
| Produto ativo | Produto deve estar ativo para movimentação | PRODUCT_INACTIVE |

### 2. Validação de Quantidade
| Regra | Descrição | Erro |
|-------|-----------|------|
| Quantidade obrigatória | Campo quantity é obrigatório | QUANTITY_REQUIRED |
| Quantidade positiva | Quantidade deve ser > 0 | INVALID_QUANTITY |
| Quantidade inteira | Quantidade deve ser número inteiro | QUANTITY_NOT_INTEGER |
| Estoque suficiente | quantity <= stock_quantity | INSUFFICIENT_STOCK |
| Estoque não negativo | Operação não pode gerar estoque negativo | NEGATIVE_STOCK |

### 3. Validações de Referência
| Campo | Regra | Descrição |
|-------|-------|-----------|
| referenceId | Opcional | Número da nota fiscal, pedido, etc |
| referenceType | Opcional | Tipo da referência (SALE, ORDER, RETURN) |
| notes | Opcional | Observações, máximo 500 caracteres |

---

## Fluxo de Validação - Saída

```
1. Recebe requisição POST /api/movements/exit
   ↓
2. Middleware: validatePositiveQuantity
   - Verifica quantity > 0
   - Verifica quantity é número inteiro
   ↓
3. Middleware: validateProductExists
   - Busca produto no banco
   - Verifica produto ativo
   ↓
4. Middleware: validateStockBeforeExit
   - Verifica estoque disponível
   - Verifica se operação não causa estoque negativo
   ↓
5. Controller: createExitMovement
   - Registra movimentação
   - Atualiza estoque
   - Retorna resposta
```

---

## Exemplos Práticos

### 1. Saída Válida
```json
POST /api/movements/exit
{
  "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "quantity": 5,
  "unitPrice": 29.90,
  "referenceId": "PED-001",
  "referenceType": "ORDER",
  "notes": "Venda para cliente"
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
      "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "type": "OUT",
      "quantity": 5,
      "previousStock": 20,
      "currentStock": 15,
      "unitPrice": 29.90,
      "totalPrice": 149.50,
      "referenceId": "PED-001",
      "referenceType": "ORDER",
      "notes": "Venda para cliente",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "product": {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "name": "Produto Teste",
      "code": "TEST001",
      "stockQuantity": 15
    }
  }
}
```

---

### 2. Saída com Estoque Insuficiente
```json
POST /api/movements/exit
{
  "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "quantity": 100
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "INSUFFICIENT_STOCK",
  "message": "Estoque insuficiente. Disponível: 15",
  "currentStock": 15
}
```

---

### 3. Saída com Produto Inativo
```json
POST /api/movements/exit
{
  "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "quantity": 5
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "PRODUCT_INACTIVE",
  "message": "Produto inativo. Não é possível realizar saída"
}
```

---

### 4. Saída com Quantidade Negativa
```json
POST /api/movements/exit
{
  "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "quantity": -5
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "INVALID_QUANTITY",
  "message": "Quantidade deve ser maior que zero"
}
```

---

### 5. Saída sem Quantidade
```json
POST /api/movements/exit
{
  "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "error": "QUANTITY_REQUIRED",
  "message": "Quantidade é obrigatória"
}
```

---

### 6. Saída Rápida por Código
```json
POST /api/movements/quick-exit
{
  "code": "TEST001",
  "quantity": 2,
  "notes": "Venda balcão"
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Saída registrada com sucesso",
  "data": {
    "product": {
      "id": "uuid",
      "name": "Produto Teste",
      "code": "TEST001",
      "previousStock": 15,
      "newStock": 13
    },
    "quantity": 2,
    "remainingStock": 13
  }
}
```

---

### 7. Saída em Lote
```json
POST /api/movements/batch-exit
{
  "items": [
    { "productId": "uuid-1", "quantity": 2, "notes": "Item 1" },
    { "productId": "uuid-2", "quantity": 1, "notes": "Item 2" },
    { "productId": "uuid-3", "quantity": 5, "notes": "Item 3" }
  ]
}
```

**Resposta de Sucesso (207):**
```json
{
  "success": true,
  "message": "2 itens processados, 1 falhas",
  "data": {
    "success": [
      {
        "productId": "uuid-1",
        "productName": "Produto 1",
        "quantity": 2,
        "newStock": 8
      },
      {
        "productId": "uuid-2",
        "productName": "Produto 2",
        "quantity": 1,
        "newStock": 4
      }
    ],
    "errors": [
      {
        "productId": "uuid-3",
        "quantity": 5,
        "error": "Estoque insuficiente. Disponível: 3"
      }
    ]
  }
}
```

---

### 8. Saída com Alerta de Estoque Baixo
```json
POST /api/movements/exit
{
  "productId": "uuid-produto",
  "quantity": 3
}
```

**Resposta com Alerta:**
```json
{
  "success": true,
  "message": "Saída de estoque registrada com sucesso",
  "warning": {
    "type": "LOW_STOCK",
    "message": "Estoque baixo! Restam apenas 3 unidades. Estoque mínimo: 5"
  },
  "data": {
    "movement": {
      "type": "OUT",
      "quantity": 3,
      "previousStock": 6,
      "currentStock": 3
    },
    "product": {
      "name": "Produto Teste",
      "stockQuantity": 3
    }
  }
}
```

---

## Alertas de Estoque

Quando uma saída faz o estoque ficar igual ou abaixo do mínimo, um alerta é incluído na resposta:

| Nível | Condição | Mensagem |
|-------|----------|----------|
| WARNING | stock_quantity <= min_stock | Estoque baixo! Restam apenas X unidades |
| CRITICAL | stock_quantity == 0 | Produto sem estoque |

---

## Performance

- Índices aplicados: `product_id`, `created_at`, `type`
- Validações em middleware para falhar rápido (fail fast)
- Transações garantem consistência ACID
- Saídas em lote processadas com transações individuais

---

## Boas Práticas

1. **Sempre validar** estoque antes de qualquer saída
2. **Usar transações** para operações críticas
3. **Logar erros** para auditoria
4. **Retornar mensagens claras** para o frontend
5. **Manter histórico** completo de todas as movimentações

---

## Manutenção

### Verificar produtos com estoque baixo
```sql
SELECT name, code, stock_quantity, min_stock 
FROM products 
WHERE stock_quantity <= min_stock;
```

### Verificar movimentações suspeitas
```sql
SELECT * FROM movements 
WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
AND notes LIKE '%ajuste%';
```

### Limpar alertas antigos (futuro)
```sql
-- Manter apenas alertas não resolvidos
DELETE FROM low_stock_alerts 
WHERE resolved_at IS NOT NULL 
AND resolved_at < DATE_SUB(NOW(), INTERVAL 30 DAY);


