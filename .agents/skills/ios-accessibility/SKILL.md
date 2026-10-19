---
name: ios-accessibility
description: Diretrizes de Acessibilidade do Apple HIG para garantir que a aplicação seja utilizável por todos, incluindo pessoas com deficiências.
---

# ♿ Apple HIG: Acessibilidade (Accessibility)

O design acessível permite que pessoas de todas as habilidades utilizem seu aplicativo com sucesso. No StackLab, as seguintes diretrizes devem ser estritamente seguidas ao desenvolver interfaces em React Native:

## 1. Suporte a Texto Dinâmico (Dynamic Type)
*   **Fontes Escaláveis:** Use tamanhos de fonte que possam crescer ou diminuir de acordo com as configurações do sistema do usuário (`allowFontScaling={true}` no React Native).
*   **Layout Responsivo:** O layout não deve quebrar se o texto aumentar. Evite alturas fixas em contêineres de texto; permita que eles expandam verticalmente.

## 2. Contraste Visual e Cor
*   **Contraste Mínimo:** Mantenha uma taxa de contraste mínima de 4.5:1 para texto normal e 3:1 para textos grandes em relação ao plano de fundo.
*   **Não dependa apenas da cor:** Nunca use a cor como a única maneira de comunicar estado (ex: um erro não deve ser apenas "vermelho", deve ter também um ícone ou texto explicativo de erro).

## 3. Alvos de Toque (Touch Targets)
*   **Tamanho Mínimo:** Todo elemento interativo (botões, links) deve ter uma área de toque mínima de **44x44 points/pixels**.
*   **Espaçamento:** Deixe espaço suficiente ao redor de alvos pequenos para evitar toques acidentais em ações destrutivas.

## 4. Leitores de Tela (VoiceOver)
*   Forneça descrições contextuais usando `accessibilityLabel` e `accessibilityHint` no React Native.
*   Marque corretamente os papéis dos elementos usando `accessibilityRole="button"`, `accessibilityRole="header"`, etc.
*   Agrupe elementos relacionados em um único bloco de leitura (`accessible={true}` em um contêiner `View`).
