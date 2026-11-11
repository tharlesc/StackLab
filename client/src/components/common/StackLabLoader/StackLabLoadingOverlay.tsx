import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { StackLabLoader } from './StackLabLoader';

export interface StackLabLoadingOverlayProps {
  /**
   * Controla a visibilidade do overlay.
   */
  visible: boolean;
  /**
   * Mensagem descritiva do processo em andamento.
   * Padrão: "Carregando..."
   */
  message?: string;
  /**
   * Subtexto opcional com instruções ou detalhes adicionais.
   */
  subtext?: string;
  /**
   * Se o overlay deve ter fundo 100% opaco preto ou semitransparente.
   * Padrão: false (semitransparente com backdrop escuro suave)
   */
  opaque?: boolean;
  /**
   * Tamanho do squircle da logo.
   * Padrão: 88
   */
  loaderSize?: number;
  /**
   * Identificador para testes automatizados.
   */
  testID?: string;
}

const useNative = Platform.OS !== 'web';

/**
 * 💫 StackLabLoadingOverlay — Modal / Overlay de Carregamento da Aplicação
 *
 * Exibe um overlay elegante e imersivo com o loader animado da StackLab para ser
 * utilizado durante requisições de login, sincronização de dados ou mutações assíncronas.
 */
export const StackLabLoadingOverlay: React.FC<StackLabLoadingOverlayProps> = ({
  visible,
  message = 'Carregando...',
  subtext,
  opaque = false,
  loaderSize = 88,
  testID = 'stacklab-loading-overlay',
}) => {
  const fadeAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const pulseAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: useNative,
      }).start();

      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: useNative,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: useNative,
          }),
        ]),
      );

      pulseLoop.start();

      return () => {
        pulseLoop.stop();
      };
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: useNative,
      }).start();
    }
  }, [visible, fadeAnim, pulseAnim]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.backdrop,
            {
              backgroundColor: opaque ? '#000000' : 'rgba(0, 0, 0, 0.82)',
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.card}>
            {/* Loader Animado da Marca */}
            <StackLabLoader size={loaderSize} loop showGlint />

            {/* Mensagem de Feedback */}
            {!!message && (
              <Animated.Text style={[styles.message, { opacity: pulseAnim }]}>
                {message}
              </Animated.Text>
            )}

            {/* Subtexto Informativo */}
            {!!subtext && <Text style={styles.subtext}>{subtext}</Text>}
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (s: any) => (StyleSheet?.create ? StyleSheet.create(s) : s);

const styles = createStyles({
  backdrop: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99998,
    paddingHorizontal: 24,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 36,
    borderRadius: 24,
    backgroundColor: 'rgba(28, 28, 30, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
    minWidth: 220,
  },
  message: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FAFC',
    marginTop: 20,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  subtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
  },
});

export default StackLabLoadingOverlay;
