type orchardModalTextType = {
  label: string,
  title: string,
  buttons: {
    primary: string,
    secondary: string
  }
}

type orchardModalOptions = {
  delete: orchardModalTextType,
  change: orchardModalTextType
}

export default orchardModalOptions;
