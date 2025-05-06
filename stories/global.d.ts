/* eslint-disable */
// This file is a workaround for a Storybook/TypeScript bug where the global JSX namespace is not available for MDX type
// definitions, causing type errors in @types/mdx. Remove this file once the upstream bug is fixed and Storybook/MDX
// types work without it.
import type * as React from 'react';

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any> {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
