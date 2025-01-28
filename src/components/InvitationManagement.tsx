'use client';

import React, { useState } from 'react';
import { useStore } from '@/store';
import { Plus, Clock, X, MailIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const InvitationManagement = () => {
  const { invitations, sendInvitation, cancelInvitation, checkInvitationLimits } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { canInvite, remainingInvites } = checkInvitationLimits();
  const pendingInvites = invitations.filter(inv => inv.status === 'pending');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await sendInvitation(email, message);
      setEmail('');
      setMessage('');
      setShowForm(false);
      setSuccess('Invitation sent successfully');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCancel = async (invitationId: string) => {
    try {
      await cancelInvitation(invitationId);
      setSuccess('Invitation cancelled');
    } catch (error: any) {
      setError('Failed to cancel invitation');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-[#242526] rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Athlete Invitations</h2>
        {canInvite && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3] flex items-center"
            disabled={!canInvite}
          >
            <Plus className="w-4 h-4 mr-2" />
            Invite Athlete
          </button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 bg-green-500/10 text-green-500 border-green-500/20">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {showForm && (
        <div className="mb-6 p-4 border border-[#3A3B3C] rounded-lg bg-[#18191A]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-white mb-1">Message (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 bg-[#242526] border border-[#3A3B3C] rounded-lg text-white focus:border-[#00A3E0] focus:outline-none"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-[#3A3B3C] rounded-lg hover:bg-[#3A3B3C] text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#00A3E0] text-white px-4 py-2 rounded-lg hover:bg-[#0077A3]"
              >
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <div className="text-sm text-gray-400 mb-2">
          {canInvite 
            ? `${remainingInvites} invitations remaining`
            : 'Maximum pending invitations reached'}
        </div>
        
        {pendingInvites.length > 0 ? (
          <div className="space-y-3">
            {pendingInvites.map((invite) => (
              <div 
                key={invite.id}
                className="flex items-center justify-between p-4 border border-[#3A3B3C] rounded-lg bg-[#18191A]"
              >
                <div className="flex items-center space-x-4">
                  <MailIcon className="w-5 h-5 text-[#00A3E0]" />
                  <div>
                    <div className="text-white font-medium">{invite.email}</div>
                    <div className="text-sm text-gray-400">
                      Expires {formatDate(invite.expiresAt)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleCancel(invite.id)}
                  className="text-red-500 hover:text-red-600 p-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No pending invitations
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationManagement;