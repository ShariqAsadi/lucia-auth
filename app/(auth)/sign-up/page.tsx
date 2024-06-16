import SignUpForm from '@/components/SignUpForm';
import { validateRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function SignUpPage() {
  const { user } = await validateRequest();
  if (user) {
    return redirect('/');
  }
  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      <h1>Sign Up</h1>
      <div className='max-w-[240px]'>
        <SignUpForm />
      </div>
    </div>
  );
}
