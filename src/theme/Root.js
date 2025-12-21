import React from 'react';
import SimpleRagChatbot from '@site/src/components/SimpleRagChatbot';

/**
 * Root component that wraps the entire Docusaurus application
 * Used to add global functionality like the SimpleRagChatbot
 */
export default function Root({ children }) {
  return (
    <>
      {children}
      <SimpleRagChatbot />
    </>
  );
}