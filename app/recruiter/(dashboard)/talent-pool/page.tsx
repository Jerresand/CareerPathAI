import { redirect } from 'next/navigation';
import { getUser, getAllTalentsWithProfiles } from '@/lib/db/queries';
import TalentPoolClient from './talent-pool-client';

export default async function TalentPoolPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  if (user.userType !== 'recruiter') {
    redirect('/talent');
  }

  // Fetch all talent profiles with user information
  // This will ensure every talent has a profile
  const talents = await getAllTalentsWithProfiles();

  return <TalentPoolClient talents={talents} />;
} 