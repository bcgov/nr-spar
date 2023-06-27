import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import KeycloakService from '../service/KeycloakService';

const getHeader = () => {
  const token = KeycloakService.getToken();
  return {
    Authorization: `Bearer ${token}`,
    'content-type': 'multipart/form-data'
  };
};

interface UploadArgs {
  uploadUrl: string
  file: File
}

const useFileUploadMutation = () => {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<void, AxiosError, UploadArgs>(
    (args) => axios.post(
      args.uploadUrl,
      args.file,
      {
        onUploadProgress: (ev) => setProgress(Math.round((ev.loaded * 100) / (ev.total ?? 1))),
        headers: getHeader()
      }
    )
  );

  return { ...mutation, progress };
};

export default useFileUploadMutation;
