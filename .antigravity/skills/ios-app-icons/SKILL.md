---
name: ios-app-icons
description: Diretrizes do Apple HIG para criação do ícone principal do aplicativo (App Icon).
---

# 📱 Apple HIG: Ícones do App (App Icons)

O App Icon é a primeira impressão que os usuários têm do seu aplicativo. Para o StackLab, o ícone principal deve ser desenhado focado em clareza, reconhecimento imediato e simplicidade.

## 1. Abrace a Simplicidade
*   **Ponto Focal Único:** Crie um ícone focado em um único elemento central ou símbolo que capture a essência do StackLab.
*   **Evite excesso de detalhes:** Linhas finas, muitos elementos ou fundos ruidosos se perdem quando o ícone é reduzido (como na busca do sistema ou notificações).

## 2. Sem Textos ou Palavras (Na Maioria dos Casos)
*   Não inclua o nome do aplicativo no ícone. O nome já aparecerá abaixo do ícone na tela inicial do dispositivo. Use texto apenas se for o elemento central da marca (como um monograma ou logotipo muito icônico).

## 3. Evite Fotos e Transparências
*   A Apple não permite fundo transparente em ícones do iOS. O fundo deve ser opaco. O sistema aplicará a máscara padrão de cantos arredondados (Squircle) automaticamente; portanto, crie o ícone em formato quadrado preenchido.
*   Evite fotos reais no ícone, prefira ilustrações e vetores estéticos.

## 4. Contraste Contra Diversos Papéis de Parede
*   Lembre-se que as pessoas usam todo tipo de papel de parede (Light e Dark). Não deixe o contorno do seu ícone se fundir com o fundo (não use fundo 100% branco ou 100% preto se a borda não tiver distinção visual).

## 5. Múltiplos Tamanhos
*   Forneça assets de alta qualidade nos tamanhos exatos exigidos pelo App Store Connect e pelo Expo (geralmente uma imagem 1024x1024px limpa para o `icon.png` no Expo, que cuidará do redimensionamento).
