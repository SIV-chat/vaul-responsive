'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import './style.css';
import { Content, Handle, Overlay, Portal } from './content';
import { NestedRoot, Root } from './root';

export { Content, Handle, Overlay, Portal, NestedRoot, Root };
export { useDrawerContext } from './context';
export type { DrawerContextValue } from './context';
export type { ContentProps, HandleProps } from './content';
export type { DialogProps, WithFadeFromProps, WithoutFadeFromProps } from './root';
export type { DrawerDirection, DrawerPresentation, DrawerPresentationMode } from './types';

export const Drawer = {
  Root,
  NestedRoot,
  Content,
  Overlay,
  Trigger: DialogPrimitive.Trigger,
  Portal,
  Handle,
  Close: DialogPrimitive.Close,
  Title: DialogPrimitive.Title,
  Description: DialogPrimitive.Description,
};
