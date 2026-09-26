import React from 'react';
import { Container, TitleContainer, Title, Subtitle, ContentContainer } from './styles';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export const Header = ({
  title,
  subtitle,
  leftContent,
  rightContent,
}: HeaderProps) => {
  return (
    <Container>
      {leftContent && (
        <ContentContainer style={{ marginRight: 16, gap: 0 }}>
          {leftContent}
        </ContentContainer>
      )}

      <TitleContainer>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </TitleContainer>

      {rightContent && (
        <ContentContainer>
          {rightContent}
        </ContentContainer>
      )}
    </Container>
  );
};
