import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn, logout } from '../../service/AuthService';

const Logout = () => {
  const navigate = useNavigate();
  const [ signed, setSigned ] = useState<boolean>(false);

  useEffect(() => {
    const isAuth = isLoggedIn();
    console.log(`Logout - useEffect: isAuth=${isAuth}`);
    setSigned(isAuth);
    if (signed) {
      logout()
        .then(() => {
          navigate('/');
        });
    }
  }, [signed]);

  return (
    <>
    </>
  );
};

export default Logout;
