export default interface CallbackHandlers {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}
