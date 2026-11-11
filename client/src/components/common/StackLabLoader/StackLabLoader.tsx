import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  ViewStyle,
  StyleProp,
} from 'react-native';

export interface StackLabLoaderProps {
  /**
   * Tamanho em pixels da caixa squircle do loader.
   * Padrão: 100
   */
  size?: number;
  /**
   * Se a animação deve rodar.
   * Padrão: true
   */
  animated?: boolean;
  /**
   * Se a animação deve rodar em loop contínuo.
   * Se false, para com a logo montada e reluzindo.
   * Padrão: true
   */
  loop?: boolean;
  /**
   * Se exibe o feixe de luz diagonal (glint) que varre a logo.
   * Padrão: true
   */
  showGlint?: boolean;
  /**
   * Estilo customizado para o container externo.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Identificador para testes automatizados.
   */
  testID?: string;
}

const useNative = Platform.OS !== 'web';

/**
 * 🧱 StackLabLoader — Componente de Carregamento Animado da Marca StackLab
 *
 * Implementa com precisão milimétrica a animação oficial da marca StackLab:
 * 1. O squircle laranja característico com profundidade e raio 22%
 * 2. As 3 barras brancas em degrau (Base, Meio, Topo) caindo com física de gravidade,
 *    impacto e squash & stretch na aterrissagem
 * 3. Pulso sutil de assentamento do bloco inteiro no encaixe da última barra
 * 4. Feixe de luz diagonal (glint) varrendo a peça
 * 5. Saída em cascata acelerada para a esquerda com estiramento horizontal
 * 6. Reinício contínuo do ciclo em loop suave e ininterrupto
 */
export const StackLabLoader: React.FC<StackLabLoaderProps> = ({
  size = 100,
  animated = true,
  loop = true,
  showGlint = true,
  style,
  testID = 'stacklab-loader',
}) => {
  // Proporções exatas derivadas da especificação StackLab (base 480x480)
  const squircleRadius = Math.round(size * 0.22);
  const barWidth = Math.round(size * 0.4042);
  const barHeight = Math.max(4, Math.round(size * 0.05625));
  const barRadius = barHeight / 2;

  // Posições X e Y das barras no tile
  const centerX = (size - barWidth) / 2;
  const stepOffset = Math.round(size * 0.0583); // ~28px em 480px

  const bar1Left = centerX - stepOffset;
  const bar2Left = centerX;
  const bar3Left = centerX + stepOffset;

  const bar1Top = Math.round(size * 0.6167 - barHeight / 2);
  const bar2Top = Math.round(size * 0.5000 - barHeight / 2);
  const bar3Top = Math.round(size * 0.3833 - barHeight / 2);

  // Valores animados
  const tileScale = useRef(new Animated.Value(1)).current;

  // Barra 1 (Base)
  const bar1TranslateY = useRef(new Animated.Value(animated ? -size * 0.9 : 0)).current;
  const bar1TranslateX = useRef(new Animated.Value(0)).current;
  const bar1ScaleX = useRef(new Animated.Value(1)).current;
  const bar1ScaleY = useRef(new Animated.Value(1)).current;
  const bar1Opacity = useRef(new Animated.Value(animated ? 0 : 1)).current;

  // Barra 2 (Meio)
  const bar2TranslateY = useRef(new Animated.Value(animated ? -size * 0.9 : 0)).current;
  const bar2TranslateX = useRef(new Animated.Value(0)).current;
  const bar2ScaleX = useRef(new Animated.Value(1)).current;
  const bar2ScaleY = useRef(new Animated.Value(1)).current;
  const bar2Opacity = useRef(new Animated.Value(animated ? 0 : 1)).current;

  // Barra 3 (Topo)
  const bar3TranslateY = useRef(new Animated.Value(animated ? -size * 0.9 : 0)).current;
  const bar3TranslateX = useRef(new Animated.Value(0)).current;
  const bar3ScaleX = useRef(new Animated.Value(1)).current;
  const bar3ScaleY = useRef(new Animated.Value(1)).current;
  const bar3Opacity = useRef(new Animated.Value(animated ? 0 : 1)).current;

  // Glint (feixe de luz)
  const glintTranslateX = useRef(new Animated.Value(-size * 0.7)).current;
  const glintOpacity = useRef(new Animated.Value(0)).current;

  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!animated) {
      tileScale.setValue(1);
      bar1TranslateY.setValue(0);
      bar1TranslateX.setValue(0);
      bar1ScaleX.setValue(1);
      bar1ScaleY.setValue(1);
      bar1Opacity.setValue(1);

      bar2TranslateY.setValue(0);
      bar2TranslateX.setValue(0);
      bar2ScaleX.setValue(1);
      bar2ScaleY.setValue(1);
      bar2Opacity.setValue(1);

      bar3TranslateY.setValue(0);
      bar3TranslateX.setValue(0);
      bar3ScaleX.setValue(1);
      bar3ScaleY.setValue(1);
      bar3Opacity.setValue(1);

      glintOpacity.setValue(0);
      return;
    }

    let isMounted = true;

    const resetInitial = () => {
      tileScale.setValue(1);

      bar1TranslateY.setValue(-size * 0.9);
      bar1TranslateX.setValue(0);
      bar1ScaleX.setValue(1);
      bar1ScaleY.setValue(1);
      bar1Opacity.setValue(0);

      bar2TranslateY.setValue(-size * 0.9);
      bar2TranslateX.setValue(0);
      bar2ScaleX.setValue(1);
      bar2ScaleY.setValue(1);
      bar2Opacity.setValue(0);

      bar3TranslateY.setValue(-size * 0.9);
      bar3TranslateX.setValue(0);
      bar3ScaleX.setValue(1);
      bar3ScaleY.setValue(1);
      bar3Opacity.setValue(0);

      glintTranslateX.setValue(-size * 0.7);
      glintOpacity.setValue(0);
    };

    const buildCycleAnimation = () => {
      // 1. Queda da Barra 1
      const dropBar1 = Animated.sequence([
        Animated.parallel([
          Animated.timing(bar1Opacity, {
            toValue: 1,
            duration: 40,
            useNativeDriver: useNative,
          }),
          Animated.timing(bar1TranslateY, {
            toValue: 0,
            duration: 250,
            easing: Easing.in(Easing.quad),
            useNativeDriver: useNative,
          }),
        ]),
        // Impacto squash & stretch
        Animated.parallel([
          Animated.sequence([
            Animated.timing(bar1ScaleY, {
              toValue: 0.8,
              duration: 50,
              useNativeDriver: useNative,
            }),
            Animated.timing(bar1ScaleY, {
              toValue: 1,
              duration: 110,
              easing: Easing.out(Easing.back(1.8)),
              useNativeDriver: useNative,
            }),
          ]),
          Animated.sequence([
            Animated.timing(bar1ScaleX, {
              toValue: 1.08,
              duration: 50,
              useNativeDriver: useNative,
            }),
            Animated.timing(bar1ScaleX, {
              toValue: 1,
              duration: 110,
              easing: Easing.out(Easing.back(1.8)),
              useNativeDriver: useNative,
            }),
          ]),
        ]),
      ]);

      // 2. Queda da Barra 2
      const dropBar2 = Animated.sequence([
        Animated.parallel([
          Animated.timing(bar2Opacity, {
            toValue: 1,
            duration: 40,
            useNativeDriver: useNative,
          }),
          Animated.timing(bar2TranslateY, {
            toValue: 0,
            duration: 250,
            easing: Easing.in(Easing.quad),
            useNativeDriver: useNative,
          }),
        ]),
        // Impacto squash & stretch
        Animated.parallel([
          Animated.sequence([
            Animated.timing(bar2ScaleY, {
              toValue: 0.8,
              duration: 50,
              useNativeDriver: useNative,
            }),
            Animated.timing(bar2ScaleY, {
              toValue: 1,
              duration: 110,
              easing: Easing.out(Easing.back(1.8)),
              useNativeDriver: useNative,
            }),
          ]),
          Animated.sequence([
            Animated.timing(bar2ScaleX, {
              toValue: 1.08,
              duration: 50,
              useNativeDriver: useNative,
            }),
            Animated.timing(bar2ScaleX, {
              toValue: 1,
              duration: 110,
              easing: Easing.out(Easing.back(1.8)),
              useNativeDriver: useNative,
            }),
          ]),
        ]),
      ]);

      // 3. Queda da Barra 3
      const dropBar3 = Animated.sequence([
        Animated.parallel([
          Animated.timing(bar3Opacity, {
            toValue: 1,
            duration: 40,
            useNativeDriver: useNative,
          }),
          Animated.timing(bar3TranslateY, {
            toValue: 0,
            duration: 250,
            easing: Easing.in(Easing.quad),
            useNativeDriver: useNative,
          }),
        ]),
        // Impacto squash & stretch
        Animated.parallel([
          Animated.sequence([
            Animated.timing(bar3ScaleY, {
              toValue: 0.8,
              duration: 50,
              useNativeDriver: useNative,
            }),
            Animated.timing(bar3ScaleY, {
              toValue: 1,
              duration: 110,
              easing: Easing.out(Easing.back(1.8)),
              useNativeDriver: useNative,
            }),
          ]),
          Animated.sequence([
            Animated.timing(bar3ScaleX, {
              toValue: 1.08,
              duration: 50,
              useNativeDriver: useNative,
            }),
            Animated.timing(bar3ScaleX, {
              toValue: 1,
              duration: 110,
              easing: Easing.out(Easing.back(1.8)),
              useNativeDriver: useNative,
            }),
          ]),
        ]),
      ]);

      // 4. Pulso do tile com o impacto da última barra
      const pulseTile = Animated.sequence([
        Animated.timing(tileScale, {
          toValue: 1.038,
          duration: 70,
          easing: Easing.out(Easing.quad),
          useNativeDriver: useNative,
        }),
        Animated.timing(tileScale, {
          toValue: 1,
          duration: 110,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: useNative,
        }),
      ]);

      // 5. Glint diagonal varrendo a peça
      const sweepGlint = Animated.parallel([
        Animated.sequence([
          Animated.timing(glintOpacity, {
            toValue: 0.45,
            duration: 90,
            easing: Easing.out(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.delay(180),
          Animated.timing(glintOpacity, {
            toValue: 0,
            duration: 110,
            easing: Easing.in(Easing.quad),
            useNativeDriver: useNative,
          }),
        ]),
        Animated.timing(glintTranslateX, {
          toValue: size * 1.5,
          duration: 380,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: useNative,
        }),
      ]);

      // 6. Saída em cascata para a esquerda (Barra 3 -> 2 -> 1)
      const exitCascade = Animated.parallel([
        // Barra 3 sai primeiro
        Animated.parallel([
          Animated.timing(bar3TranslateX, {
            toValue: -size * 0.9,
            duration: 280,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: useNative,
          }),
          Animated.timing(bar3ScaleX, {
            toValue: 2.2,
            duration: 280,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: useNative,
          }),
          Animated.sequence([
            Animated.delay(120),
            Animated.timing(bar3Opacity, {
              toValue: 0,
              duration: 160,
              useNativeDriver: useNative,
            }),
          ]),
        ]),
        // Barra 2 sai com delay de 70ms
        Animated.sequence([
          Animated.delay(70),
          Animated.parallel([
            Animated.timing(bar2TranslateX, {
              toValue: -size * 0.9,
              duration: 280,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: useNative,
            }),
            Animated.timing(bar2ScaleX, {
              toValue: 2.2,
              duration: 280,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: useNative,
            }),
            Animated.sequence([
              Animated.delay(120),
              Animated.timing(bar2Opacity, {
                toValue: 0,
                duration: 160,
                useNativeDriver: useNative,
              }),
            ]),
          ]),
        ]),
        // Barra 1 sai com delay de 140ms
        Animated.sequence([
          Animated.delay(140),
          Animated.parallel([
            Animated.timing(bar1TranslateX, {
              toValue: -size * 0.9,
              duration: 280,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: useNative,
            }),
            Animated.timing(bar1ScaleX, {
              toValue: 2.2,
              duration: 280,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: useNative,
            }),
            Animated.sequence([
              Animated.delay(120),
              Animated.timing(bar1Opacity, {
                toValue: 0,
                duration: 160,
                useNativeDriver: useNative,
              }),
            ]),
          ]),
        ]),
      ]);

      const steps: Animated.CompositeAnimation[] = [
        dropBar1,
        Animated.delay(60),
        dropBar2,
        Animated.delay(60),
        Animated.parallel([dropBar3, Animated.sequence([Animated.delay(250), pulseTile])]),
      ];

      if (showGlint) {
        steps.push(Animated.delay(50));
        steps.push(sweepGlint);
      }

      if (loop) {
        steps.push(Animated.delay(350)); // Respiro estático de contemplação da logo
        steps.push(exitCascade);
        steps.push(Animated.delay(120)); // Tile limpo antes de recomeçar
      }

      return Animated.sequence(steps);
    };

    const startLoop = () => {
      if (!isMounted) return;
      resetInitial();

      animationRef.current = buildCycleAnimation();
      animationRef.current.start(({ finished }) => {
        if (finished && isMounted && loop) {
          startLoop();
        }
      });
    };

    startLoop();

    return () => {
      isMounted = false;
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [animated, loop, size, showGlint]);

  const glintWidth = Math.round(size * 0.18);
  const glintHeight = Math.round(size * 2.2);

  return (
    <View
      style={[
        styles.outerContainer,
        {
          width: size,
          height: size,
        },
        style,
      ]}
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel="Carregando StackLab"
    >
      <Animated.View
        style={[
          styles.tileContainer,
          {
            width: size,
            height: size,
            borderRadius: squircleRadius,
            transform: [{ scale: tileScale }],
          },
        ]}
      >
        {/* Camada base de cor laranja StackLab */}
        <View style={[StyleSheet.absoluteFill, styles.tileBase]} />

        {/* Camada de profundidade/brilho superior */}
        <View style={[StyleSheet.absoluteFill, styles.tileHighlight]} />

        {/* Glint (feixe de luz diagonal reflexiva) */}
        {showGlint && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glintWrapper,
              {
                width: glintWidth,
                height: glintHeight,
                opacity: glintOpacity,
                transform: [
                  { translateX: glintTranslateX },
                  { rotate: '27deg' },
                ],
              },
            ]}
          />
        )}

        {/* Barra 1 (Base) */}
        <Animated.View
          style={[
            styles.bar,
            {
              width: barWidth,
              height: barHeight,
              borderRadius: barRadius,
              left: bar1Left,
              top: bar1Top,
              opacity: bar1Opacity,
              transform: [
                { translateY: bar1TranslateY },
                { translateX: bar1TranslateX },
                { scaleX: bar1ScaleX },
                { scaleY: bar1ScaleY },
              ],
            },
          ]}
        />

        {/* Barra 2 (Meio) */}
        <Animated.View
          style={[
            styles.bar,
            {
              width: barWidth,
              height: barHeight,
              borderRadius: barRadius,
              left: bar2Left,
              top: bar2Top,
              opacity: bar2Opacity,
              transform: [
                { translateY: bar2TranslateY },
                { translateX: bar2TranslateX },
                { scaleX: bar2ScaleX },
                { scaleY: bar2ScaleY },
              ],
            },
          ]}
        />

        {/* Barra 3 (Topo) */}
        <Animated.View
          style={[
            styles.bar,
            {
              width: barWidth,
              height: barHeight,
              borderRadius: barRadius,
              left: bar3Left,
              top: bar3Top,
              opacity: bar3Opacity,
              transform: [
                { translateY: bar3TranslateY },
                { translateX: bar3TranslateX },
                { scaleX: bar3ScaleX },
                { scaleY: bar3ScaleY },
              ],
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const createStyles = (s: any) => (StyleSheet?.create ? StyleSheet.create(s) : s);

const styles = createStyles({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileContainer: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FC6734',
    shadowColor: '#FC6734',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  tileBase: {
    backgroundColor: '#FE5503',
  },
  tileHighlight: {
    backgroundColor: '#FC6734',
    opacity: 0.9,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    borderTopWidth: 1,
  },
  glintWrapper: {
    position: 'absolute',
    top: '-60%',
    left: '-20%',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 9999,
    zIndex: 1,
  },
  bar: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    zIndex: 2,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
});

export default StackLabLoader;
