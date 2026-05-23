import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthUser, UserRole, clearAuth, fetchCurrentUser, getStoredAuth } from './api';

export function useRequireAuth(lang: string, requiredRole?: UserRole) {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const storedAuth = getStoredAuth();

    if (!storedAuth) {
      setLoadingAuth(false);
      navigate(`/${lang}/login`, { replace: true });
      return;
    }

    if (requiredRole && storedAuth.user.role !== requiredRole) {
      clearAuth();
      navigate(`/${lang}/login`, { replace: true });
      return;
    }

    setAuthUser(storedAuth.user);

    fetchCurrentUser()
      .then((user) => {
        if (requiredRole && user.role !== requiredRole) {
          clearAuth();
          navigate(`/${lang}/login`, { replace: true });
          return;
        }

        setAuthUser(user);
      })
      .catch(() => {
        clearAuth();
        navigate(`/${lang}/login`, { replace: true });
      })
      .finally(() => {
        setLoadingAuth(false);
      });
  }, [lang, navigate, requiredRole]);

  return { authUser, loadingAuth };
}
