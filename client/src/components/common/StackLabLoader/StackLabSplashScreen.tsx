import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StackLabLoader } from './StackLabLoader';

export interface StackLabSplashScreenProps {
  /**
   * Mensagem de status exibida abaixo da logo (ex.: "Inicializando...", "Entrando no StackLab...").
   */
  message?: string;
  /**
   * Subtítulo descritivo complementar.
   */
  subtitle?: string;
  /**
   * Se exibe o título da marca "StackLab".
   * Padrão: true
   */
  showBrandTitle?: boolean;
  /**
   * Tamanho do loader animado.
   * Padrão: 120
   */
  loaderSize?: number;
  /**
   * Se exibe a etiqueta de versão ou rodapé institucional.
   * Padrão: true
   */
  showFooter?: boolean;
  /**
   * Identificador para testes automatizados.
   */
  testID?: string;
}

const useNative = Platform.OS !== 'web';

/**
 * 🚀 StackLabSplashScreen — Tela de Abertura / Carregamento Completa StackLab
 *
 * Exibe a identidade visual completa da plataforma com o squircle animado oficial,
 * tipografia Inter em alta definição e status pulsante para inicialização, login ou transições.
 */
export const StackLabSplashScreen: React.FC<StackLabSplashScreenProps> = ({
  message = 'Carregando...',
  subtitle,
  showBrandTitle = true,
  loaderSize = 120,
  showFooter = true,
  testID = 'stacklab-splash-screen',
}) => {
  const { height } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Fade in suave ao montar a tela
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: useNative,
    }).start();

    // Pulso sutil no texto de status
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: useNative,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.55,
          duration: 900,
          useNativeDriver: useNative,
        }),
      ]),
    );

    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, [fadeAnim, pulseAnim]);

  return (
    <View style={styles.container} testID={testID}>
      <StatusBar style="light" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Loader Animado da Marca */}
        <View style={styles.loaderWrapper}>
          <StackLabLoader size={loaderSize} loop showGlint />
        </View>

        {/* Título da Marca */}
        {showBrandTitle && (
          <View style={styles.brandTitleContainer}>
            <Text style={styles.brandTitle}>StackLab</Text>
            <View style={styles.brandAccentDot} />
          </View>
        )}

        {/* Mensagem de Status */}
        {!!message && (
          <Animated.Text style={[styles.statusMessage, { opacity: pulseAnim }]}>
            {message}
          </Animated.Text>
        )}

        {/* Subtítulo complementar */}
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </Animated.View>

      {/* Rodapé da Aplicação */}
      {showFooter && (
        <View style={[styles.footer, { bottom: Math.max(28, height * 0.04) }]}>
          <Text style={styles.footerApp}>Engenharia & Gestão de Obras</Text>
          <Text style={styles.footerVersion}>StackLab Mobile • v1.0.0</Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (s: any) => (StyleSheet?.create ? StyleSheet.create(s) : s);

const styles = createStyles({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loaderWrapper: {
    marginBottom: 24,
  },
  brandTitleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  brandTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
  brandAccentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FC6734',
    marginLeft: 3,
  },
  statusMessage: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#CBD5E1',
    letterSpacing: 0.2,
    marginTop: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    alignItems: 'center',
  },
  footerApp: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#64748B',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  footerVersion: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#475569',
  },
});

export default StackLabSplashScreen;
