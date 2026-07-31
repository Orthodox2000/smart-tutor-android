'use client';

import React from 'react';
import PageBackButton from '../../../components/PageBackButton';
import AuditLogPanel from '../../../components/audit-log-panel';

export default function AuditLogsPage() {
  return (
    <div className="space-y-4 pb-20">
      <header className="flex items-center gap-2">
        <PageBackButton />
        <div className="flex-1" />
      </header>
      <AuditLogPanel />
    </div>
  );
}
