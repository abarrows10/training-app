'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function InvitationResponsePage({ params }: { params: { inviteId: string } }) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const docRef = doc(db, `coaches/${invitation.coachId}/invitations/${params.inviteId}`);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          setError('Invitation not found');
          return;
        }

        const inviteData = docSnap.data();
        if (inviteData.status !== 'pending') {
          setError('This invitation has already been processed');
          return;
        }

        if (new Date(inviteData.expiresAt) < new Date()) {
          setError('This invitation has expired');
          return;
        }

        setInvitation(inviteData);
      } catch (error) {
        setError('Error loading invitation');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInvitation();
    }
  }, [user, params.inviteId]);

  const handleResponse = async (accept: boolean) => {
    if (!user || !invitation) return;

    try {
      const docRef = doc(db, `coaches/${invitation.coachId}/invitations/${params.inviteId}`);
      await updateDoc(docRef, {
        status: accept ? 'accepted' : 'declined',
        respondedAt: new Date().toISOString()
      });

      if (accept) {
        // Update user's athlete profile
        await updateDoc(doc(db, 'users', user.uid), {
          role: 'athlete',
          coachId: invitation.coachId
        });

        // Create athlete record in coach's collection
        await updateDoc(doc(db, `coaches/${invitation.coachId}/athletes/${user.uid}`), {
          name: user.displayName || user.email,
          email: user.email,
          joinedAt: new Date().toISOString()
        });

        router.push('/athlete/workouts');
      } else {
        router.push('/');
      }
    } catch (error) {
      setError('Failed to process invitation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#18191A]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#00A3E0]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#18191A] p-4">
        <div className="bg-[#242526] rounded-xl p-6 shadow-lg max-w-md w-full">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#18191A] p-4">
      <div className="bg-[#242526] rounded-xl p-6 shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6">Training Invitation</h1>
        <p className="text-gray-300 mb-6">
          You've been invited to join {invitation?.coachName || 'a coach'}'s training program.
          Would you like to accept?
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={() => handleResponse(true)}
            className="flex-1 bg-[#00A3E0] text-white px-4 py-3 rounded-lg hover:bg-[#0077A3] transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Accept
          </button>
          <button
            onClick={() => handleResponse(false)}
            className="flex-1 bg-red-500/10 text-red-500 px-4 py-3 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}