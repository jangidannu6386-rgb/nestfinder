import LandlordAuthForm from '@/components/landlord/LandlordAuthForm';

export const metadata = { title: 'Landlord Sign Up | NestFinder' };

export default function LandlordSignupPage() {
  return <LandlordAuthForm mode="signup" />;
}
