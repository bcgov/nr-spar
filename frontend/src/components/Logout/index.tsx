import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isCurrentAuthUser, logout } from '../../service/AuthService';

const Logout = () => {
  const navigate = useNavigate();
  const [ signed, setSigned ] = useState<boolean>(false);

  useCallback(async () => {
    const isAuth = await isCurrentAuthUser();
    setSigned(isAuth);
    //logout
  }, []);

  useEffect(() => {
    if (signed) {
      logout()
        .then(() => {
          navigate('/');
        });
    } else {
      navigate('/');
    }
  }, [signed]);

  

  return (
    <>
    </>
  );
};

export default Logout;
