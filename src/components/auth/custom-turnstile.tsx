import React from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

interface CustomTurnstileProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  width?: string | number;
}

/**
 * 自定义 Turnstile 组件
 * 这是一个简单的包装器，用于设置宽度
 * 注意：现在我们直接使用 @marsidev/react-turnstile 的 Turnstile 组件，
 * 并通过 style 属性设置宽度，所以这个组件已不再需要
 */
export const CustomTurnstile: React.FC<CustomTurnstileProps> = ({
  siteKey,
  onSuccess,
  onError,
  onExpire,
  theme = 'auto',
  size = 'normal',
  width = '100%'
}) => {
  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={onSuccess}
      onError={onError}
      onExpire={onExpire}
      options={{
        theme,
        size
      }}
      style={{ width: typeof width === 'number' ? `${width}px` : width }}
    />
  );
};
