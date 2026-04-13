import React from 'react';
import { AuthProvider } from '@site/src/context/AuthContext';
import SimpleRagChatbot from '@site/src/components/SimpleRagChatbot';
import NavbarUser from '@site/src/components/NavbarUser';

export default function Root({ children }) {
  return (
    <AuthProvider>
      {children}
      <SimpleRagChatbot />
      <NavbarUser />
    </AuthProvider>
  );
}
