'use client';

import { useInView } from 'react-intersection-observer';

/**
 * Props for the FadeIn component:
 * @param {React.ReactNode} children - The content to animate.
 * @param {'bottom' | 'left' | 'right' | 'top'} [direction='bottom'] - The direction to fade in from.
 * @param {number} [delay=0] - Delay in milliseconds.
 * @param {string} [className] - Additional classes to apply to the wrapper.
 */

export default function FadeIn({
  children,
  direction = 'bottom',
  delay = 0,
  className = '',
}) {
  // 1. useInView hook
  const { ref, inView } = useInView({
    /**
     * triggerOnce: true
     * This is the most important prop. It ensures the animation
     * only runs once when the element enters the viewport.
     */
    // triggerOnce: true,
    /**
     * threshold: 0.1
     * This means the animation will trigger when 10% of the
     * element is visible. Adjust this value as needed.
     */
    threshold: 0.1,
  });

  // 2. Determine initial (hidden) styles based on direction
  let initialStyles = 'opacity-0';
  switch (direction) {
    case 'bottom':
      initialStyles += ' translate-y-10'; // 10 units down
      break;
    case 'left':
      initialStyles += ' -translate-x-10'; // 10 units left
      break;
    case 'right':
      initialStyles += ' translate-x-10'; // 10 units right
      break;
    case 'top':
      initialStyles += ' -translate-y-10'; // 10 units up
      break;
    default:
      initialStyles += ' translate-y-10';
  }

  // 3. Determine final (visible) styles
  const finalStyles = 'opacity-100 translate-y-0 translate-x-0';

  // 4. Combine all classes
  const classes = `
    ${className}
    transition-all ease-in-out duration-700
    ${inView ? finalStyles : initialStyles}
  `;

  return (
    <div
      ref={ref}
      className={classes}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}