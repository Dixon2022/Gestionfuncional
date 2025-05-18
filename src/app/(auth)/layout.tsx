interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/80 to-indigo-600 p-4">
      <div className="w-full max-w-md rounded-xl bg-card p-8 shadow-2xl">
        {children}
      </div>
    </div>
  );
}
