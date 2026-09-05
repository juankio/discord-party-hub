export type ViewportCategory = 'mobile' | 'tablet' | 'desktop';

export interface ViewportProportions {
  category: ViewportCategory;
  aspectRatio: string;
  containerPadding: string;
  nameBadgeMaxWidth: string;
  historyBarMaxHeight: string;
}

export const BREAKPOINTS = {
  MOBILE_MAX: 639,
  TABLET_MIN: 640,
  TABLET_MAX: 1024,
  DESKTOP_MIN: 1025
} as const;

export const ALERT_TOUCH_TARGET = {
  MIN_SIZE_PX: 44,
  CLOSE_BTN_CLASS: 'min-w-[44px] min-h-[44px]',
  ACTION_BTN_CLASS: 'min-h-[44px]'
} as const;

export function getViewportCategory(width: number): ViewportCategory {
  if (width < BREAKPOINTS.TABLET_MIN) return 'mobile';
  if (width <= BREAKPOINTS.TABLET_MAX) return 'tablet';
  return 'desktop';
}

export function getResponsiveLayout(width: number): ViewportProportions {
  const category = getViewportCategory(width);

  switch (category) {
    case 'mobile':
      return {
        category: 'mobile',
        aspectRatio: 'aspect-[16/10]',
        containerPadding: 'px-6',
        nameBadgeMaxWidth: 'max-w-[85px]',
        historyBarMaxHeight: 'max-h-[220px]'
      };
    case 'tablet':
      return {
        category: 'tablet',
        aspectRatio: 'aspect-[2/1]',
        containerPadding: 'px-12',
        nameBadgeMaxWidth: 'max-w-[140px]',
        historyBarMaxHeight: 'max-h-[320px]'
      };
    case 'desktop':
      return {
        category: 'desktop',
        aspectRatio: 'aspect-[2/1]',
        containerPadding: 'px-14',
        nameBadgeMaxWidth: 'max-w-[180px]',
        historyBarMaxHeight: 'max-h-[640px]'
      };
  }
}

export function isTouchTargetCompliant(sizePx: number): boolean {
  return sizePx >= ALERT_TOUCH_TARGET.MIN_SIZE_PX;
}
