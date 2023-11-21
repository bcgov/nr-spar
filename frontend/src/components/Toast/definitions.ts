/**
 * From react-toastify:
 * When you render a component, a closeToast prop and the toastProps
 * are injected into your component.
 * Therefor the closeToast and toastProps are needed
 * but we don't do anything with it.
 */
type CustomToastProps = {
  closeToast?: any,
  toastProps?: any,
  title: string,
  subtitle: string
};

export default CustomToastProps;
