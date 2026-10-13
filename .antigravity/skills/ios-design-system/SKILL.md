---
name: ios-design-system
description: Regras e padrões de UI/UX baseados no Apple Human Interface Guidelines (HIG) para serem aplicados no desenvolvimento do design system do StackLab.
---

# 🍏 Apple Human Interface Guidelines - StackLab Design System

Esta skill contém os fundamentos extraídos do **Apple Human Interface Guidelines (HIG)** para guiar a criação e refatoração de interfaces no StackLab, garantindo que o app tenha um visual e comportamento nativos e de alta qualidade (especialmente focado em iOS, mas aplicável de forma geral).

## 1. Princípios de Design (Design Principles)

Para garantir o máximo impacto e alcance, o design da nossa aplicação deve ser guiado pelos seguintes princípios centrais da Apple:

*   **Integridade Estética (Aesthetic Integrity):** A aparência e o comportamento do app devem estar em perfeita harmonia com a sua função. Um app focado em produtividade ou gestão (como o StackLab) deve ter gráficos sutis, tipografia clara e layout estruturado para manter o usuário focado nas tarefas.
*   **Consistência (Consistency):** Utilize padrões do sistema. Ícones padrão (ex: `lucide-react-native` bem mapeados), estilos de texto, e controles consistentes garantem que as pessoas saibam como usar o app desde o primeiro uso, transferindo conhecimentos que já possuem.
*   **Manipulação Direta (Direct Manipulation):** Permita que as pessoas manipulem objetos na tela diretamente em vez de usar controles separados. Rotação do dispositivo, gestos de pinça e deslizar na tela para interagir tornam a experiência mais envolvente.
*   **Feedback (Feedback):** Toda ação deve ter uma reação. Forneça respostas visuais, auditivas ou táteis (Haptics) para ações, como destacar um botão quando tocado ou mostrar um indicador de progresso durante carregamentos.
*   **Metáforas (Metaphors):** Telas e interações devem usar metáforas familiares do mundo real ou do mundo digital (ex: mover arquivos para pastas, deslizar abas como páginas de um livro, switches que parecem interruptores).
*   **Controle do Usuário (User Control):** As pessoas, não os apps, estão no controle. O app pode sugerir ações ou alertar sobre consequências perigosas, mas não deve tomar decisões pelo usuário sem permissão. Sempre forneça a capacidade de "cancelar" ou "voltar".

---

## 2. Projetando para iOS (Designing for iOS)

Como um aplicativo móvel, o iOS possui temas arquitetônicos específicos que diferenciam a plataforma:

*   **Clareza (Clarity):** O texto deve ser legível em qualquer tamanho, os ícones precisos e lúcidos, as decorações sutis e o foco tem que estar na funcionalidade. O espaço em branco, cor, fontes e gráficos devem realçar o conteúdo principal e comunicar interatividade.
*   **Deferência (Deference):** O movimento fluido e a interface elegante ajudam as pessoas a entenderem e interagirem com o conteúdo, nunca competindo com ele. O conteúdo deve sempre preencher a tela inteira, com o uso mínimo possível de molduras, bordas pesadas ou gradientes agressivos.
*   **Profundidade (Depth):** Camadas visuais distintas e movimentos realistas transmitem hierarquia, vitalidade e facilitam a compreensão do contexto. Transições devem fornecer o senso de "onde estou" e "de onde vim".

---

## 3. Fundamentos de Design (Foundations)

Estes são os alicerces práticos a serem aplicados diretamente nos componentes do React Native/Styled-components:

### Acessibilidade (Accessibility)
O design deve ser utilizável para todos.
*   Suporte a **Dynamic Type** (tamanhos de texto variados controlados pelo usuário).
*   Contraste de cor adequado.
*   Áreas de toque (Touch Targets) de no mínimo **44x44 points**.

### Cor (Color)
*   **Dark Mode:** Sempre projete o app considerando interfaces claras (Light) e escuras (Dark). Use o `ThemeContext` para inverter as paletas suavemente.
*   Use a cor para comunicar estado (ex: vermelho para erro/destrutivo, verde ou cor primária da marca para sucesso/ação).

### Tipografia (Typography)
*   O iOS usa **San Francisco (SF)**. No React Native, utilize as fontes do sistema, ou se importando fontes via Expo (como o Inter, que é parecido com a SF), mantenha a hierarquia clássica:
    *   **Large Titles** para cabeçalhos de seções principais.
    *   **Body** claro e legível para conteúdo padrão.
    *   **Footnote / Caption** para informações secundárias.

### Layout e Safe Areas
*   Respeite o **Safe Area** (`SafeAreaProvider` / `SafeAreaView`) para garantir que botões e textos nunca fiquem escondidos pelo Notch da câmera (Dynamic Island/Notch) ou pelo Home Indicator na base da tela.
*   Use margens consistentes (geralmente `16px` a `24px` de padding lateral padrão).

### Materiais e Blur (Materials)
*   Sempre que possível e para dar sensação de contexto nativo, utilize fundos translúcidos (Blur effects) em Navbars, TabBars e modais para que o conteúdo possa rolar por baixo e ainda assim dar ideia de continuidade de espaço e profundidade.

---

## 🚀 Como Aplicar Isso no StackLab
Ao construir novos componentes em `client/src/components`:
1. Use botões grandes e fáceis de tocar (`TouchableOpacity` com padding robusto).
2. Evite criar "vistas" desnecessárias que quebrem a harmonia com as diretrizes iOS (não use excesso de sombras ou cores neon pesadas).
3. Prefira modais que sobem do fundo da tela (`presentation: 'modal'` no Expo Router) para fluxos rápidos de edição.
4. Mantenha os avisos e validações como *Alerts* curtos e com feedback imediato.
