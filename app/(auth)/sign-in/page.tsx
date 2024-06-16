import SignInForm from '@/components/SignInForm';
import { validateRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function SignInPage() {
  const { user } = await validateRequest();
  if (user) {
    return redirect('/');
  }

  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      <h1>Sign In</h1>
      <div className='max-w-[240px]'>
        <SignInForm />
      </div>
    </div>
  );
}
