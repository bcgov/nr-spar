type orchardModalTextType = {
  label: string,
  title: string,
  buttons: {
    primary: string,
    secondary: string
  }
}

type orchardModalOptions = {
  add: orchardModalTextType,
  delete: orchardModalTextType,
  change: orchardModalTextType
}

export default orchardModalOptions;
