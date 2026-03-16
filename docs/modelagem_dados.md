# 📊 Modelagem de Dados - Inventory Management System

## Visão Geral

Este documento descreve a modelagem de dados do sistema de gestão de estoque, incluindo entidades, relacionamentos, regras de negócio e otimizações.

## Entidades Principais

### 1. Users (Usuários)
Armazena informações dos usuários do sistema.

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|------------|
| id | CHAR(36) | UUID único | PK, Default UUID() |
| name | VARCHAR(100) | Nome completo | NOT NULL |
| email | VARCHAR(255) | Email | UNIQUE, NOT NULL |
| password | VARCHAR(255) | Hash da senha | NOT NULL |
| role | ENUM | admin/manager/operator | DEFAULT 'operator' |
| is_active | BOOLEAN | Conta ativa | DEFAULT TRUE |

**Regras de Negócio:**
- Email deve ser único
- Apenas admins podem criar outros admins
- Senhas devem ter mínimo 8 caracteres

### 2. Categories (Categorias)
Organização hierárquica dos produtos.

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|------------|
| id | CHAR(36) | UUID único | PK |
| name | VARCHAR(100) | Nome da categoria | UNIQUE, NOT NULL |
| slug | VARCHAR(100) | Versão URL-friendly | UNIQUE, NOT NULL |
| parent_id | CHAR(36) | Categoria pai | FK, ON DELETE SET NULL |

**Regras de Negócio:**
- Nome da categoria deve ser único
- Slug é gerado automaticamente a partir do nome
- Categorias podem ter subcategorias (auto-relacionamento)

### 3. Products (Produtos)
Cadastro principal de produtos.

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|------------|
| id | CHAR(36) | UUID único | PK |
| code | VARCHAR(50) | Código interno | UNIQUE, NOT NULL |
| name | VARCHAR(255) | Nome do produto | NOT NULL |
| category_id | CHAR(36) | Categoria | FK, NOT NULL |
| price | DECIMAL(10,2) | Preço venda | >= 0, NOT NULL |
| stock_quantity | INT | Quantidade | >= 0, DEFAULT 0 |
| min_stock | INT | Estoque mínimo | >= 0, DEFAULT 5 |
| max_stock | INT | Estoque máximo | >= 0, DEFAULT 100 |

**Regras de Negócio:**
- Código do produto deve ser único
- Preço não pode ser negativo
- Estoque nunca pode ser negativo
- Se stock_quantity <= min_stock, gerar alerta
- max_stock deve ser >= min_stock

### 4. Movements (Movimentações)
Registro de todas as movimentações de estoque.

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|------------|
| id | CHAR(36) | UUID único | PK |
| movement_number | VARCHAR(50) | Número do movimento | UNIQUE |
| type | ENUM | IN/OUT/ADJUSTMENT | NOT NULL |
| product_id | CHAR(36) | Produto | FK, NOT NULL |
| quantity | INT | Quantidade | != 0 |
| previous_stock | INT | Estoque antes | NOT NULL |
| current_stock | INT | Estoque depois | NOT NULL |
| created_by | CHAR(36) | Usuário | FK, NOT NULL |

**Regras de Negócio:**
- Quantidade não pode ser zero
- Em saídas, validar estoque disponível
- Movimentos são imutáveis após criados
- Cancelamento reverte o estoque

## Triggers

### 1. Atualização Automática de Estoque
Quando um movimento é inserido, o estoque do produto é automaticamente atualizado.

```sql
-- Exemplo: Entrada de 10 unidades
INSERT INTO movements (product_id, type, quantity) 
VALUES ('uuid-produto', 'IN', 10);
-- Resultado: products.stock_quantity += 10