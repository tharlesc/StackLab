import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Menu, Plus, RefreshCcw, Settings } from 'lucide-react-native';
import { BuildingIcon, PlusIcon, RefreshIcon, UserCogIcon } from '../../../../assets/svg';
import { Container, Row, Tab, TabLabel, ActionContainer, ActionButton, ActionLabel, IconWrapper, QueueBadge, QueueBadgeText } from './styles';

export interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  queueCount?: number;
}

























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
