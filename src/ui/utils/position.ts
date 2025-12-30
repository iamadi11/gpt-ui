/**
 * V6.1: Positioning utility for preview popovers
 * Handles viewport clamping, placement, and composer avoidance
 */

export interface PopoverPosition {
  top: number;
  left: number;
  placement: 'left' | 'right' | 'top' | 'bottom';
}

export interface PositionOptions {
  anchorRect: DOMRect;
  popoverWidth: number;
  popoverHeight: number;
  viewportPadding?: number;
  avoidComposer?: boolean;
  composerBottom?: number; // Y position of composer top edge
  preferredPlacement?: 'left' | 'right' | 'top' | 'bottom';
  containerRect?: DOMRect; // For drawer, the container bounds
}

/**
 * Calculate optimal popover position
 */
export function calculatePopoverPosition(options: PositionOptions): PopoverPosition {
  const {
    anchorRect,
    popoverWidth,
    popoverHeight,
    viewportPadding = 12,
    avoidComposer = false,
    composerBottom = window.innerHeight - 160, // Default: bottom 160px is no-fly zone
    preferredPlacement,
    containerRect,
  } = options;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const viewportRight = viewportWidth - viewportPadding;
  const viewportBottom = avoidComposer ? composerBottom : viewportHeight - viewportPadding;
  const viewportLeft = viewportPadding;
  const viewportTop = viewportPadding;

  // Use container bounds if provided (for drawer)
  const boundsRight = containerRect ? containerRect.right : viewportRight;
  const boundsLeft = containerRect ? containerRect.left : viewportLeft;
  const boundsTop = containerRect ? containerRect.top : viewportTop;
  const boundsBottom = containerRect ? containerRect.bottom : viewportBottom;

  let placement: 'left' | 'right' | 'top' | 'bottom' = preferredPlacement || 'right';
  let left = 0;
  let top = 0;

  // Try preferred placement first
  if (placement === 'right') {
    left = anchorRect.right + 8;
    top = anchorRect.top;
    
    // Check if fits on right
    if (left + popoverWidth > boundsRight) {
      // Try left
      const leftPos = anchorRect.left - popoverWidth - 8;
      if (leftPos >= boundsLeft) {
        placement = 'left';
        left = leftPos;
      } else {
        // Doesn't fit left either, try top
        placement = 'top';
        left = anchorRect.left + (anchorRect.width - popoverWidth) / 2;
        top = anchorRect.top - popoverHeight - 8;
      }
    }
  } else if (placement === 'left') {
    left = anchorRect.left - popoverWidth - 8;
    top = anchorRect.top;
    
    // Check if fits on left
    if (left < boundsLeft) {
      // Try right
      const rightPos = anchorRect.right + 8;
      if (rightPos + popoverWidth <= boundsRight) {
        placement = 'right';
        left = rightPos;
      } else {
        // Try top
        placement = 'top';
        left = anchorRect.left + (anchorRect.width - popoverWidth) / 2;
        top = anchorRect.top - popoverHeight - 8;
      }
    }
  } else if (placement === 'top') {
    left = anchorRect.left + (anchorRect.width - popoverWidth) / 2;
    top = anchorRect.top - popoverHeight - 8;
    
    // Check if fits above
    if (top < boundsTop) {
      // Try bottom
      placement = 'bottom';
      top = anchorRect.bottom + 8;
    }
  } else {
    // bottom
    left = anchorRect.left + (anchorRect.width - popoverWidth) / 2;
    top = anchorRect.bottom + 8;
    
    // Check if fits below
    if (top + popoverHeight > boundsBottom) {
      // Try top
      placement = 'top';
      top = anchorRect.top - popoverHeight - 8;
    }
  }

  // Clamp to viewport/bounds
  left = Math.max(boundsLeft, Math.min(left, boundsRight - popoverWidth));
  top = Math.max(boundsTop, Math.min(top, boundsBottom - popoverHeight));

  // Avoid composer area
  if (avoidComposer && top + popoverHeight > composerBottom) {
    // Move upward
    top = composerBottom - popoverHeight - 8;
    // If still doesn't fit, place above anchor
    if (top < anchorRect.top) {
      top = anchorRect.top - popoverHeight - 8;
      placement = 'top';
    }
  }

  return { top, left, placement };
}

