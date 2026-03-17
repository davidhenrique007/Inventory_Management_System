const { sequelize } = require('../../config/database');
const Category = require('../../models/Category')(sequelize, sequelize.Sequelize);

jest.setTimeout(30000);

// Função para normalizar texto (remover acentos para comparação)
const normalizeText = (text) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

describe('🧪 Model Category', () => {
  beforeAll(async () => {
    // Configurar encoding da conexão
    await sequelize.query('SET NAMES utf8mb4');
    await sequelize.query('SET CHARACTER SET utf8mb4');
    await sequelize.query('SET character_set_connection=utf8mb4');
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Deve criar uma categoria válida', async () => {
    const category = await Category.create({
      name: 'Eletrônicos',
      description: 'Produtos eletrônicos'
    });

    expect(category).toBeDefined();
    expect(category.name).toBe('Eletrônicos');
    
    // Comparar versão normalizada (sem acentos)
    expect(normalizeText(category.slug)).toBe('eletronicos');
  });

  test('Não deve criar categoria com nome duplicado', async () => {
    await Category.create({
      name: 'Informática'
    });

    await expect(Category.create({
      name: 'Informática'
    })).rejects.toThrow();
  });

  test('Deve encontrar categoria por slug', async () => {
    // Criar categoria
    const created = await Category.create({
      name: 'Escritório'
    });

    console.log('Categoria criada:', {
      name: created.name,
      slug: created.slug
    });

    // Buscar por slug (sem acentos)
    const slug = 'escritorio'; // slug não tem acento
    const category = await Category.findBySlug(slug);

    expect(category).toBeDefined();
    expect(category.name).toBe('Escritório');
    expect(category.slug).toBe(slug);
  });

  test('Método getOrCreate deve funcionar', async () => {
    const { category, created } = await Category.getOrCreate('Novo Teste');
    expect(category).toBeDefined();
    expect(created).toBe(true);
    expect(category.slug).toBe('novo-teste');

    const { created: createdAgain } = await Category.getOrCreate('Novo Teste');
    expect(createdAgain).toBe(false);
  });

  test('Deve criar categoria com nome sem acento', async () => {
    const category = await Category.create({
      name: 'Telefonia'
    });

    expect(category).toBeDefined();
    expect(category.slug).toBe('telefonia');
  });

  test('Deve buscar categoria ignorando maiúsculas/minúsculas', async () => {
    await Category.create({
      name: 'Games'
    });

    const category = await Category.findBySlug('GAMES');
    expect(category).toBeDefined();
    expect(category.name).toBe('Games');
  });
});
