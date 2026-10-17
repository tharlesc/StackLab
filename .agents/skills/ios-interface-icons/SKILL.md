---
name: ios-interface-icons
description: Diretrizes do Apple HIG para a construção e uso de ícones de interface na navegação do aplicativo.
---

# 🔍 Apple HIG: Ícones de Interface (Icons)

No iOS, a clareza se baseia fortemente na qualidade e consistência dos ícones da interface (como aqueles presentes na Tab Bar inferior ou Header). No StackLab (utilizando bibliotecas como `lucide-react-native` ou similares), siga estas diretrizes:

## 1. Compreensibilidade Rápida (Metáforas Fortes)
*   Se um ícone não for instantaneamente reconhecível (uma casinha para Home, uma engrenagem para Settings), é provável que ele gere confusão. O design da Apple favorece glifos claros, universais e sem ambiguidades.
*   Se não houver um ícone perfeito e universal para a ação, prefira usar apenas *Texto* na interface em vez de um ícone que as pessoas não entenderão.

## 2. Pesos e Contornos Uniformes (Stroke Weights)
*   **Consistência é vital.** Todos os ícones da interface (especialmente num conjunto como uma Bottom Navigation Bar) devem ter a mesma espessura de linha, estilo e tamanho de contêiner delimitador (Bounding Box).
*   No React Native, garanta que propriedades como `size`, `strokeWidth` e `color` sejam uniformes na criação dos seus botões.

## 3. Estado Ativo vs. Inativo
*   **Tab Bars:** A diretriz tradicional da Apple para Bottom Tabs sugere que o ícone do estado inativo seja apenas **contornado (outlined)** e o do estado ativo seja **preenchido (solid/filled)**. Isso dá um feedback rápido de localização, além de usar a cor de Accent para o item ativo.

## 4. Legibilidade
*   Não reduza o tamanho do ícone a menos de `24x24` pixels na barra de navegação para que o glifo permaneça discernível.
*   Mantenha um alinhamento perfeito (optical alignment) caso posicione o ícone ao lado de um texto ou rótulo (Label).
