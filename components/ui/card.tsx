import type { TextRef, ViewRef } from '@rn-primitives/types';
import * as React from 'react';
import { Text, type TextProps, View, type ViewProps } from 'react-native';
import { cn } from '~/lib/utils';
import { TextClassContext } from '~/components/ui/text';

// Utvid ViewProps for å inkludere children
interface CardProps extends ViewProps {
  className?: string;
  children?: React.ReactNode;
}

const Card = React.forwardRef<ViewRef, CardProps>(({ className, children, ...props }, ref) => (
  <View
    ref={ref}
    className={cn(
      'rounded-lg border border-border bg-card shadow-md',
      className
    )}
    {...props}
  >
    {children}
  </View>
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<ViewRef, CardProps>(({ className, children, ...props }, ref) => (
  <View ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
    {children}
  </View>
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<TextRef, TextProps>(({ className, children, ...props }, ref) => (
  <Text
    role='heading'
    aria-level={3}
    ref={ref}
    className={cn(
      'text-2xl text-card-foreground font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  >
    {children}
  </Text>
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<TextRef, TextProps>(
  ({ className, children, ...props }, ref) => (
    <Text ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </Text>
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<ViewRef, CardProps>(
  ({ className, children, ...props }, ref) => (
    <TextClassContext.Provider value='text-card-foreground'>
      <View ref={ref} className={cn('p-6 pt-0', className)} {...props}>
        {children}
      </View>
    </TextClassContext.Provider>
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<ViewRef, CardProps>(({ className, children, ...props }, ref) => (
  <View ref={ref} className={cn('flex flex-row items-center p-6 pt-0', className)} {...props}>
    {children}
  </View>
));
CardFooter.displayName = 'CardFooter';

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
