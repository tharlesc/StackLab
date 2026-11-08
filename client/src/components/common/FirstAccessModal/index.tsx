import React, { useState, useCallback } from 'react';
import { View, Text, Alert } from 'react-native';
import { useTheme } from 'styled-components/native';
import { KeyRound, ShieldCheck } from 'lucide-react-native';
import { Dialog } from '@/components/common/Dialog';
import { Input } from '@/components/common/Input';
import { useAuth } from '@/contexts/AuthContext';

export interface FirstAccessModalProps {
  visible: boolean;
  onSuccess?: () => void;
}

export const FirstAccessModal = ({ visible, onSuccess }: FirstAccessModalProps) => {
  const theme = useTheme();
  const { user, completeFirstAccess } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirmChange = useCallback(async () => {
    if (!newPassword.trim()) {
      Alert.alert('Atenção', 'Digite sua nova senha.');
      return;
    }

    if (newPassword.trim().length < 6) {
      Alert.alert('Senha Curta', 'A nova senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      Alert.alert('Senhas Divergentes', 'A confirmação de senha não confere com a nova senha digitada.');
      return;
    }

    setLoading(true);
    try {
      await completeFirstAccess(newPassword.trim());
      Alert.alert('Sucesso', 'Sua nova senha foi cadastrada com sucesso! Bem-vindo ao RDO Mobile.');
      onSuccess?.();
    } catch {
      Alert.alert('Erro', 'Não foi possível cadastrar a nova senha.');
    } finally {
      setLoading(false);
    }
  }, [newPassword, confirmPassword, completeFirstAccess, onSuccess]);

  if (!visible) return null;

  return (
    <Dialog
      visible={visible}
      title="Primeiro Acesso Detectado"
      description={`Olá, ${user?.name || 'Profissional'}! Por motivos de segurança corporativa, você deve definir sua senha definitiva pessoal para concluir o primeiro acesso:`}
      primaryAction={{
        label: loading ? 'Salvando...' : 'Definir Senha Definitiva',
        onPress: handleConfirmChange,
      }}
      onClose={() => {}}
    >
      <View style={{ gap: 10, paddingVertical: 4 }}>
        <Input
          placeholder="Nova Senha (mínimo 6 caracteres)"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          accessibilityLabel="Nova Senha"
        />
        <Input
          placeholder="Confirme a Nova Senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          accessibilityLabel="Confirme a Nova Senha"
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            padding: 10,
            borderRadius: 8,
            marginTop: 4,
          }}
        >
          <ShieldCheck size={18} color="#10B981" />
          <Text style={{ fontSize: 11, color: '#047857', flex: 1 }}>
            Esta senha será de seu uso exclusivo e substituirá o código provisório de 6 dígitos gerado pelo Master.
          </Text>
        </View>
      </View>
    </Dialog>
  );
};
