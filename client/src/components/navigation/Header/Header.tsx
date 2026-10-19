import React from 'react';
import { Container, TitleContainer, Title, Subtitle, LeftContentContainer, ContentContainer } from './styles';

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
      {leftContent && <LeftContentContainer>{leftContent}</LeftContentContainer>}

      <TitleContainer>
        <Title accessibilityRole="header">{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </TitleContainer>

      {rightContent && <ContentContainer>{rightContent}</ContentContainer>}
    </Container>
  );
};
