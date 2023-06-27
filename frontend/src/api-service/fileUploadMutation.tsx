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

const formatFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return formData;
};

const useFileUploadMutation = () => {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<void, AxiosError, UploadArgs>(
    (args) => axios.post(
      args.uploadUrl,
      formatFile(args.file),
      {
        onUploadProgress: (progressEvent) => {
          // setProgress(Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 1)));
          setProgress(progressEvent.loaded);
        },
        headers: getHeader()
      }
    )
  );

  return { ...mutation, progress };
};

export default useFileUploadMutation;
