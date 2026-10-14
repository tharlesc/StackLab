---
name: project-structure
description: Diretrizes, arquitetura e convenções de estrutura de pastas para React Native com Expo Router no StackLab, baseadas em referências consolidadas (Expo Router, freeCodeCamp, Nitish Prasad e React FAQ).
---

# 🏗️ Estrutura de Projeto & Arquitetura — React Native + Expo Router

Esta skill define as regras arquiteturais, convenções de nomenclatura e diretrizes de organização de diretórios para o **StackLab (RDO Mobile)**. As práticas foram sintetizadas e adaptadas a partir de quatro referências consolidadas da comunidade React e React Native:

1. **Andrew Chester:** *Why I Switched to Expo Router: Best Practices and Implementation Guide*
2. **freeCodeCamp / Khoa Pham:** *Como estruturar seu projeto e gerenciar recursos estáticos no React Native*
3. **Nitish Prasad:** *React Native folder structure: How to Structure Your React Native Project*
4. **React Legacy Docs:** *File Structure FAQ (Colocation & Avoiding Over-engineering)*

---

## 1. Princípios Fundamentais de Arquitetura

1. **Separação Clara entre Rotas (`app/`) e Domínio/Apresentação (`src/`):**
   - O diretório `app/` é de uso exclusivo do **Expo Router** (File-based routing).
   - **NUNCA** coloque pastas auxiliares como `components/`, `services/`, `styles/` ou `utils/` dentro de `app/`, pois o Expo Router tratará esses diretórios como rotas públicas de URL.
   - Todo o código de lógica de negócios, componentes reutilizáveis, serviços de API, tipos e helpers deve residir dentro de `src/`.

2. **Agrupamento por Recurso (Feature-First) vs. Tipo:**
   - Agrupar exclusivamente por tipo (`components/`, `reducers/`, `views/`) fragmenta o contexto do desenvolvedor.
   - As telas e funcionalidades de negócio complexas (como as etapas do Wizard de RDO, Aprovação do Master, etc.) devem ser agrupadas por recurso, mantendo os arquivos que mudam juntos o mais próximos possível (**Colocation**).

3. **Desacoplamento entre UI e Lógica (Screen Component Directory):**
   - Telas não devem ser monolíticas nem misturar lógica pesada de validação/cálculo com JSX.
   - Cada tela ou subfluxo relevante possui sua pasta isolada contendo o componente visual, seu hook/helper de lógica e seus estilos dedicados.

4. **Evitar Aninhamento Excessivo (Regra dos 3 a 4 níveis):**
   - Respeitando o princípio do React FAQ, limite o aninhamento de pastas a no máximo 3 ou 4 níveis. Níveis profundos dificultam a navegação, criam imports quilométricos e mascaram acoplamento desnecessário.

5. **Acesso Seguro a Recursos e Design Tokens (Namespace R):**
   - Centralizar referências de assets estáticos (imagens, ícones, fontes), paleta de cores e strings de internacionalização através de constantes unificadas (evitando *magic strings* e `require` espalhados).

---

## 2. Mapa Geral de Diretórios (StackLab)

```text
client/
├── app/                          # 🌐 EXPO ROUTER (Apenas Rotas e Layouts)
│   ├── _layout.tsx               # Layout raiz: Providers, Temas, Auth Gate
│   ├── index.tsx                 # Ponto de entrada / Redirecionador inicial
│   ├── (auth)/                   # Grupo de autenticação (não afeta a URL)
│   │   ├── _layout.tsx           # Stack do fluxo de login
│   │   ├── login.tsx             # Rota: Login
│   │   └── forgot-password.tsx   # Rota: Recuperação de senha
│   ├── (common)/                 # Grupo para Usuário Comum / Operacional
│   │   ├── _layout.tsx           # Navegação do Operacional (Tabs/Stacks)
│   │   ├── obras/
│   │   │   ├── index.tsx         # Lista de Minhas Obras
│   │   │   └── [obraId]/         # Obra dinâmica
│   │   │       ├── index.tsx     # Painel da Obra & Histórico de RDOs
│   │   │       └── rdo/
│   │   │           ├── novo.tsx  # Wizard de criação de RDO
│   │   │           └── [rdoId].tsx # Detalhes/Edição de RDO devolvido
│   └── (master)/                 # Grupo para Usuário Gestor / Engenheiro RT
│       ├── _layout.tsx           # Navegação Master
│       ├── dashboard.tsx         # Dashboard com KPIs e alertas
│       ├── inbox.tsx             # Caixa de entrada de RDOs pendentes
│       └── analise/
│           └── [rdoId].tsx       # Análise, chancela, devolução e retificação
│
├── src/                          # 🧠 CÓDIGO DA APLICAÇÃO (Domínio, UI, Lógica)
│   ├── assets/                   # Assets estáticos brutos (svgs, images, fonts)
│   │   ├── fonts/
│   │   ├── icons/
│   │   └── images/
│   ├── components/               # Componentes UI reutilizáveis (Atômicos / Shared)
│   │   ├── common/               # Botões, Inputs, Cards, Badges, Modais
│   │   ├── layout/               # Headers, BottomSheets, ScreenContainers
│   │   └── rdo/                  # Componentes específicos de RDO reutilizáveis
│   ├── constants/                # Design Tokens e Namespace R
│   │   ├── colors.ts             # Cores e suporte a Dark Mode
│   │   ├── typography.ts         # Tamanhos de fonte e tipografia HIG/Material
│   │   ├── strings.ts            # Dicionários de texto / labels (i18n ready)
│   │   └── R.ts                  # Namespace unificado de recursos
│   ├── contexts/                 # React Contexts (AuthContext, OfflineSyncContext, ThemeContext)
│   ├── hooks/                    # Custom hooks utilitários globais
│   ├── navigation/               # Utilitários de navegação imperativa (NavigationService)
│   ├── screens/                  # Implementação detalhada das Telas (Visual + Lógica)
│   │   ├── auth/
│   │   ├── common/
│   │   │   ├── ObrasList/
│   │   │   ├── ObraDetail/
│   │   │   └── RDOWizard/        # Etapas isoladas do wizard (1 a 5)
│   │   └── master/
│   │       ├── Dashboard/
│   │       ├── Inbox/
│   │       └── RDOReview/
│   ├── services/                 # Comunicação externa, API e Armazenamento
│   │   ├── api/
│   │   │   ├── client.ts         # Axios/Fetch configurado com baseUrl e timeout
│   │   │   └── interceptors.ts   # Injeção de JWT, refresh token e log
│   │   ├── offline/              # Cache local e sincronização SQLite/WatermelonDB/MMKV
│   │   └── modules/              # Endpoints divididos por domínio (auth, rdo, obras)
│   ├── types/                    # Definições TypeScript organizadas por domínio
│   │   ├── auth.ts
│   │   ├── obra.ts
│   │   ├── rdo.ts
│   │   └── navigation.ts
│   └── utils/                    # Funções utilitárias puras (datas, formatação, validação)
```

---

## 3. Padrão Screen Component Directory (Folder-per-Screen)

Para cada tela que apresente complexidade visual ou lógica, utilize a estrutura recomendada por **Nitish Prasad**:

```text
src/screens/common/RDOWizard/
├── index.ts               # Exportação pública limpa da tela
├── RDOWizardView.tsx      # Componente "Dumb/Visual": focado em JSX e acessibilidade
├── useRDOWizard.ts        # Hook/Helper com todo o estado, validações e submissão
├── styles.ts              # StyleSheet ou Styled Components encapsulados
└── RDOWizard.test.tsx     # Testes unitários colocalizados
```

### Exemplo de Separação de Responsabilidades:

**1. Hook de Lógica (`useRDOWizard.ts`):**
```typescript
import { useState, useCallback } from 'react';
import { rdoService } from '@/services/modules/rdoService';

export const useRDOWizard = (obraId: string) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  const nextStep = useCallback(() => setCurrentStep((prev) => prev + 1), []);
  const prevStep = useCallback(() => setCurrentStep((prev) => Math.max(1, prev - 1)), []);

  const saveDraft = async () => {
    setLoading(true);
    try {
      await rdoService.saveDraft({ obraId, ...formData });
    } finally {
      setLoading(false);
    }
  };

  return {
    currentStep,
    loading,
    formData,
    nextStep,
    prevStep,
    saveDraft,
  };
};
```

**2. Componente de Apresentação (`RDOWizardView.tsx`):**
```typescript
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRDOWizard } from './useRDOWizard';
import { styles } from './styles';

export const RDOWizardView = ({ obraId }: { obraId: string }) => {
  const { currentStep, loading, nextStep } = useRDOWizard(obraId);

  if (loading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Etapa {currentStep} de 5</Text>
      {/* Componentes de etapa específicos */}
    </View>
  );
};
```

**3. Rota no Expo Router (`app/(common)/obras/[obraId]/rdo/novo.tsx`):**
A rota atua apenas como *casca* que lê parâmetros da URL e delega a renderização:
```typescript
import { useLocalSearchParams } from 'expo-router';
import { RDOWizardView } from '@/screens/common/RDOWizard';

export default function NovoRDORoute() {
  const { obraId } = useLocalSearchParams<{ obraId: string }>();
  return <RDOWizardView obraId={obraId} />;
}
```

---

## 4. Gestão de Recursos Estáticos: O Padrão `Namespace R`

Inspirado no artigo do **freeCodeCamp** e no modelo de recursos estáticos do Android / Airbnb Style Guide, todo recurso estático, texto ou token de cor deve ser exposto de maneira centralizada via `R`:

```typescript
// src/constants/R.ts
import { colors } from './colors';
import { typography } from './typography';
import { strings } from './strings';

export const R = {
  colors,
  typography,
  strings,
  images: {
    logo: require('@/assets/images/logo.png'),
    placeholder: require('@/assets/images/placeholder.png'),
    emptyObra: require('@/assets/images/empty-obras.png'),
  },
  icons: {
    // Referências ou nomes tipados para iconografia
  }
} as const;

export default R;
```

### Como consumir nos componentes:
```typescript
import { View, Text, Image } from 'react-native';
import { R } from '@/constants/R';

export const Header = () => (
  <View style={{ backgroundColor: R.colors.primaryBackground }}>
    <Image source={R.images.logo} />
    <Text style={{ color: R.colors.textPrimary, fontSize: R.typography.size.title }}>
      {R.strings.dashboard.title}
    </Text>
  </View>
);
```

---

## 5. Camada de Rede, Serviços & Offline-First

Para atender aos requisitos de alta criticidade e operação no canteiro de obras (RDO Mobile):

1. **`src/services/api/client.ts`:**
   - Instância única de cliente HTTP com interceptores globais.
   - Gerencia renovação de tokens JWT em caso de HTTP 401.
   - Detecta falhas de rede e redireciona requisições pendentes para a fila de sincronização offline.

2. **`src/services/offline/syncManager.ts`:**
   - Mantém uma fila transacional de ações pendentes (criação de RDO, anexo de fotos, alterações).
   - Não sinaliza dados como "enviados" até confirmação do servidor (`status: 'local' | 'synced' | 'conflict'`).

3. **`src/services/modules/`:**
   - Arquivos segregados por domínio (`authService.ts`, `obraService.ts`, `rdoService.ts`, `auditService.ts`).
   - Métodos tipados com retornos que utilizam os tipos definidos em `src/types/`.

---

## 6. Diretrizes de Importação Limpa (Path Aliases)

Nunca use caminhos relativos longos (como `../../../../components/Button`). O arquivo `tsconfig.json` do StackLab deve manter os seguintes mapeamentos:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@constants/*": ["src/constants/*"],
      "@services/*": ["src/services/*"],
      "@types/*": ["src/types/*"],
      "@screens/*": ["src/screens/*"]
    }
  }
}
```

---

## 7. Checklist de Validação de Estrutura

Antes de criar novas pastas ou arquivos, valide:
- [ ] O novo arquivo em `app/` é estritamente uma rota ou layout? (Se for componente/lógica, mova para `src/`).
- [ ] O aninhamento de pastas ultrapassa 4 níveis? Se sim, achate a hierarquia.
- [ ] A tela separa apresentação (JSX) de regras de negócio (Custom Hooks/Helpers)?
- [ ] Foram utilizadas cores ou strings soltas (hardcoded) ao invés do `R` / Design Tokens?
- [ ] O componente novo em `src/components/` é reutilizável ou pertence a uma única tela? (Se pertencer a uma única tela, coloque-o na pasta da tela).
