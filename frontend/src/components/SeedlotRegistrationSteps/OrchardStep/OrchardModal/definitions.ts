type orchardModalTextType = {
  label: string,
  title: string,
  buttons: {
    primary: string,
    secondary: string
  }
}

type orchardModalOptions = {
  [key: string]: orchardModalTextType
}

export default orchardModalOptions;
