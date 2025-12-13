import ClassicDinerLayout from './ClassicDinerLayout'
import ModernMinimalLayout from './ModernMinimalLayout'
import PlayfulCartoonLayout from './PlayfulCartoonLayout'
import type { LayoutProps } from './types'
import type { FC } from 'react'

export type LayoutType = 'layout1' | 'layout2' | 'layout3'

export type LayoutComponent = FC<LayoutProps>

export const layouts: Record<LayoutType, LayoutComponent> = {
  layout1: ClassicDinerLayout,
  layout2: ModernMinimalLayout,
  layout3: PlayfulCartoonLayout
}

export type { LayoutProps }
