import AuthForm from './AuthForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-amber-100/50 p-4 font-sans">
      <AuthForm />
    </div>
  );
}
