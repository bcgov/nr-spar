const getUrlQueryParam = (location: Location, param: string): string | null => {
  const paramString = location.search.split('?')[1];
  const queryString = new URLSearchParams(paramString);
  return queryString.get(param);
};

export default getUrlQueryParam;
