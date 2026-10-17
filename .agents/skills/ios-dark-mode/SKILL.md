---
name: ios-dark-mode
description: Diretrizes do Apple HIG para design compatível e adaptado ao Modo Escuro (Dark Mode).
---

# 🌙 Apple HIG: Dark Mode

O Modo Escuro muda radicalmente o foco visual da interface do usuário do seu app. O StackLab deve se integrar nativamente ao modo escuro do sistema (por meio de temas configuráveis no `styled-components`), obedecendo a essas diretrizes.

## 1. Não Inverta Simplesmente as Cores
*   **Branco não se torna preto absoluto.** No iOS, o fundo escuro da base do aplicativo geralmente é um preto puro (`#000000`) para poupar bateria em telas OLED. Contudo, *cards* e listas utilizam um cinza profundo (ex: `Elevated Secondary Background`) para criar contraste entre a base e as fatias de conteúdo.
*   Saturação: Cores corporativas muito vibrantes podem "vibrar" demais e causar tensão nos olhos em fundos escuros. No Dark Mode, muitas vezes é necessário reduzir a saturação (desbotar um pouco a cor de *Tint* / *Accent*) para ficar mais suave e legível.

## 2. Contraste e Texto
*   Textos não devem ser branco puro (`#FFFFFF`) na maior parte do tempo. Use tons de branco ou cinzas-claros semânticos para reduzir o brilho extremo nos olhos.
*   Em fundos escuros, use cinza-escuro em invés de sombras projetadas tradicionais (Drop Shadows no Dark Mode costumam não aparecer; o iOS usa *borders* ou *cards* mais claros para dar a noção de elevação).

## 3. Sincronia com o Sistema
*   Respeite a configuração global do dispositivo do usuário. Forneça sempre a opção no app de "Seguir padrão do Sistema" (System Default), sem forçar o usuário a estar no light/dark a menos que ele explicitamente escolha nas configurações do app.
