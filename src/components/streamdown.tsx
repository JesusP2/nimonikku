'use client';

import { cn } from '@/lib/utils';
import { type ComponentProps, memo } from 'react';
import { Streamdown } from 'streamdown';

type StreamdownProps = ComponentProps<typeof Streamdown>;

export const StreamdownRenderer = memo(
  ({ className, ...props }: StreamdownProps) => (
    <Streamdown
      className={cn(
        'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        className
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

StreamdownRenderer.displayName = 'Response';
