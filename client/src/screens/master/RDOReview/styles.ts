import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { Card } from '@/components/common/Card';

export const SectionCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
  padding-bottom: 12px;
  margin-bottom: 12px;
  gap: 8px;
`;

export const SectionTitleContainer = styled.View`
  flex: 1;
`;

export const SectionTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const SectionSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 2px;
`;

export const SectionAction = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const SectionActionText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.secondary};
`;

export const InfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.surfaceVariant};
`;

export const InfoLabel = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const InfoValue = styled.Text`
  font-family: ${({ theme }) => theme.fonts.semiBold};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const WeatherContainer = styled.View`
  padding-top: 8px;
  margin-top: 4px;
`;

export const WeatherBadgesRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
`;

export const WeatherBadge = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const WeatherBadgeText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.semiBold};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ItemCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: 10px;
  margin-bottom: 8px;
`;

export const ItemTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 2px;
`;

export const ItemSubtitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const PhotoThumbnail = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceVariant};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: 12px;
  margin-bottom: 8px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const PhotoCaption = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-top: 6px;
`;

export const WatermarkText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 4px;
`;

export const CommentBox = styled.View`
  background-color: ${({ theme }) => theme.colors.tag.notificationBg};
  border-left-width: 3px;
  border-left-color: ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  padding: 8px 12px;
  margin-top: 8px;
`;

export const CommentAuthor = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 2px;
`;

export const CommentText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ActionButtonBar = styled.View`
  padding: 16px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  gap: 10px;
`;

export const SecondaryActionsRow = styled.View`
  flex-direction: row;
  gap: 10px;
`;

export const SignatureCertificateBox = styled.View`
  background-color: ${({ theme }) => theme.colors.status.success.bg};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.status.success.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
  padding: 16px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const SignatureTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.bold};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.status.success.text};
  margin-bottom: 6px;
`;

export const SignatureText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.status.success.text};
  line-height: 16px;
`;
