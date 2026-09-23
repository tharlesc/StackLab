import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { BuildingIcon, PlusIcon, RefreshIcon, UserCogIcon } from '../../../assets/svg';

export interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  queueCount?: number;
}

// --- Styled Components ---

const Container = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
  padding-bottom: ${Platform.OS === 'ios' ? 24 : 12}px;
  padding-top: 8px;
  shadow-color: ${({ theme }) => theme.shadows.card.shadowColor};
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 3px;
  elevation: 2;
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: flex-end;
  height: 56px;
`;

const Tab = styled(TouchableOpacity)`
  flex: 1;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const TabLabel = styled.Text<{ $isActive: boolean }>`
  font-size: 10px;
  font-weight: ${({ $isActive }) => ($isActive ? '700' : '600')};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : theme.colors.text.secondary};
`;

const ActionContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  position: relative;
  top: -12px;
`;

const ActionButton = styled(TouchableOpacity)`
  width: 48px;
  height: 48px;
  background-color: ${({ theme }) => theme.colors.secondary};
  border-radius: 16px;
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
  shadow-color: ${({ theme }) => theme.colors.secondary};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 6px;
  elevation: 4;
`;

const ActionLabel = styled.Text`
  font-size: 10px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.secondary};
`;

const IconWrapper = styled.View`
  position: relative;
`;

const QueueBadge = styled.View`
  position: absolute;
  top: -4px;
  right: -8px;
  background-color: #9d4300;
  width: 16px;
  height: 16px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  border-width: 1.5px;
  border-color: ${({ theme }) => theme.colors.surface};
`;

const QueueBadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.text.inverse};
  font-size: 9px;
  font-weight: 800;
`;

// --- Component ---

export const BottomNav = ({ activeTab = 'Obras', onTabChange = () => {}, queueCount = 2 }: BottomNavProps) => {
  return (
    <Container>
      <Row>
        {/* TAB 1 - Obras */}
        <Tab onPress={() => onTabChange('Obras')} activeOpacity={0.7}>
          <BuildingIcon
            stroke={activeTab === 'Obras' ? '#0B2240' : '#64748B'}
            style={{ marginBottom: 4 }}
          />
          <TabLabel $isActive={activeTab === 'Obras'}>Obras</TabLabel>
        </Tab>

        {/* TAB 2 - Novo RDO */}
        <ActionContainer>
          <ActionButton activeOpacity={0.8} onPress={() => onTabChange('Novo RDO')}>
            <PlusIcon stroke="#FFFFFF" />
          </ActionButton>
          <ActionLabel>Novo RDO</ActionLabel>
        </ActionContainer>

        {/* TAB 3 - Fila */}
        <Tab onPress={() => onTabChange('Fila')} activeOpacity={0.7}>
          <IconWrapper>
            <RefreshIcon
              stroke={activeTab === 'Fila' ? '#0B2240' : '#64748B'}
              style={{ marginBottom: 4 }}
            />
            {queueCount > 0 && (
              <QueueBadge>
                <QueueBadgeText>{queueCount}</QueueBadgeText>
              </QueueBadge>
            )}
          </IconWrapper>
          <TabLabel $isActive={activeTab === 'Fila'}>Fila</TabLabel>
        </Tab>

        {/* TAB 4 - Ajustes */}
        <Tab onPress={() => onTabChange('Ajustes')} activeOpacity={0.7}>
          <UserCogIcon
            stroke={activeTab === 'Ajustes' ? '#0B2240' : '#64748B'}
            style={{ marginBottom: 4 }}
          />
          <TabLabel $isActive={activeTab === 'Ajustes'}>Ajustes</TabLabel>
        </Tab>
      </Row>
    </Container>
  );
};
