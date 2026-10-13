---
name: ios-color
description: Diretrizes do Apple HIG para o uso de cores (Color System) visando estética, comunicação e acessibilidade.
---

# 🎨 Apple HIG: Sistema de Cores (Color)

A cor no iOS é usada principalmente para interatividade, indicar estado e manter a continuidade da marca. No StackLab, a cor deve ser intencional e sem ruídos.

## 1. Cores de Interação (Tint / Accent Colors)
*   Escolha uma cor de "Tint" principal que diz ao usuário instantaneamente: **"Isso é clicável ou interativo"**. Todos os botões primários, ícones ativos de tab bar e links devem compartilhar ou derivar dessa cor para manter consistência.

## 2. Cores Semânticas
Em vez de depender de hexadecimais brutos (ex: `#FFFFFF` ou `#000000`), use a semântica:
*   **System Background:** Fundo primário.
*   **Secondary Background:** Elementos flutuantes, cards, agrupamentos.
*   **Label / Secondary Label:** Textos principais e textos secundários.
O uso de cores com semântica no seu `ThemeContext` facilita a implementação limpa entre Light Mode e Dark Mode.

## 3. Comunicando Estados
*   Use as cores universais do sistema para estados críticos, independente do seu branding:
    *   **Vermelho:** Erro, destruição, remoção, cancelamento.
    *   **Laranja/Amarelo:** Alertas ou avisos (Warning).
    *   **Verde:** Sucesso, aprovação, adição.

## 4. Teste Cores em Diferentes Condições
*   **Daltonismo:** Evite combinações vermelho/verde para indicar estados críticos juntos (sempre adicione um texto ou ícone acompanhando a cor).
*   Gere um contraste alto suficiente para que pessoas com deficiência visual possam ler sem forçar a vista (taxa de contraste 4.5:1).
