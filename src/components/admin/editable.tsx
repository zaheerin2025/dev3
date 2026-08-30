'use client';

import * as React from 'react';
import { useVisualEditor } from '@/lib/visual-editor';
import { getContentField } from '@/lib/content-schema';
import { cn } from '@/lib/utils';

interface EditableProps {
  /** Setting key from src/lib/content-schema.ts. */
  id: string;
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'span';
}

/**
 * Marks a region as editable in the admin visual editor.
 * With the editor off it renders nothing but the children (no extra DOM),
 * so the live site keeps its exact layout. With the editor on, the region
 * gets a dashed outline and a click opens it in the editor panel.
 */
export function Editable({ id, children, className, as: Tag = 'div' }: EditableProps) {
  const enabled = useVisualEditor((s) => s.enabled);
  const selectedKey = useVisualEditor((s) => s.selectedKey);
  const select = useVisualEditor((s) => s.select);

  if (!enabled) return <>{children}</>;

  const handleClick = (event: React.MouseEvent) => {
    // In edit mode, clicks edit content instead of following links.
    event.preventDefault();
    event.stopPropagation();
    select(id);
  };

  return (
    <Tag
      data-editable={id}
      data-ve-label={getContentField(id)?.label ?? id}
      data-ve-selected={selectedKey === id ? '1' : undefined}
      className={cn('relative', className)}
      onClick={handleClick}
    >
      {children}
    </Tag>
  );
}
