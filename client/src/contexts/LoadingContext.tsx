import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';

export interface LoadingContextData {
  /**
   * Indica se o carregamento global está visível no momento.
   */
  isLoading: boolean;
  /**
   * Mensagem atual de carregamento (ex: "Entrando no StackLab...").
   */
  message: string | null;
  /**
   * Exibe o overlay global de carregamento com uma mensagem opcional.
   */
  showLoading: (message?: string) => void;
  /**
   * Oculta o overlay global de carregamento.
   */
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextData>({} as LoadingContextData);

const LoadingConsumerOverlay: React.FC = () => {
  const { isLoading, message } = useContext(LoadingContext);
  if (!isLoading) {
    return null;
  }
  // Requer o overlay sob demanda para não poluir testes de hooks puros
  const { StackLabLoadingOverlay } = require('@/components/common/StackLabLoader');
  return <StackLabLoadingOverlay visible={isLoading} message={message || 'Carregando...'} />;
};

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const showLoading = useCallback((msg?: string) => {
    setMessage(msg || 'Carregando...');
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setMessage(null);
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      message,
      showLoading,
      hideLoading,
    }),
    [isLoading, message, showLoading, hideLoading],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingConsumerOverlay />
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextData => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export default LoadingContext;
