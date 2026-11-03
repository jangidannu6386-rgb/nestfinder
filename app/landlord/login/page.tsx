import LandlordAuthForm from '@/components/landlord/LandlordAuthForm';

export const metadata = { title: 'Landlord Login | NestFinder' };

export default function LandlordLoginPage() {
  return <LandlordAuthForm mode="login" />;
}
