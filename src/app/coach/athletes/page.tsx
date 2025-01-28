"use client";

import AthleteManagement from '@/components/athlete-management';
import InvitationManagement from '@/components/InvitationManagement';

export default function AthletesPage() {
  return (
    <div className="space-y-6">
      <AthleteManagement />
      <InvitationManagement />
    </div>
  );
}