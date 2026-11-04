import { prisma } from './config/database.js';

async function main() {
  console.log('Verificando banco de dados...');

  // 1. Cria usuário padrão se não existir
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: '277e9233-a859-4d37-bd01-3b567d1d234a',
        name: 'Tharles Silva',
        email: 'tharles@stacklab.com',
        password: 'hashed_password_123',
        role: 'Engenheiro Residente',
        crea: 'CREA-MA 987654/D',
        profile: 'common',
      },
    });
    console.log('✅ Usuário padrão criado:', user.name);
  } else {
    console.log('ℹ️ Usuário existente:', user.name);
  }

  // 2. Cria obra padrão se não existir
  let work = await prisma.work.findFirst();
  if (!work) {
    work = await prisma.work.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Torre Esmeralda',
        subtitle: 'Edifício Residencial de Alto Padrão',
        client: 'Construtora Horizonte',
        address: 'Av. dos Holandeses, 1000 - São Luís/MA',
      },
    });
    console.log('✅ Obra padrão criada:', work.name);
  } else {
    console.log('ℹ️ Obra existente:', work.name);
  }

  // 3. Vincula usuário à obra se ainda não vinculado
  const link = await prisma.userWork.findFirst({
    where: { userId: user.id, workId: work.id },
  });
  if (!link) {
    await prisma.userWork.create({
      data: { userId: user.id, workId: work.id },
    });
    console.log('✅ Usuário vinculado à obra com sucesso!');
  }

  const counts = {
    users: await prisma.user.count(),
    works: await prisma.work.count(),
    rdos: await prisma.rDO.count(),
  };

  console.log('📊 Estado do Banco de Dados SQLite:', counts);
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

