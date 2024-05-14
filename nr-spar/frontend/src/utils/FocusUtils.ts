const focusById = (id: string): void => {
  document.getElementById(id)?.focus();
};

export default focusById;
