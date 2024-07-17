export class ErrorData {
  public message: string;
  public success: boolean;

  constructor({ message, success }) {
    this.message = message;
    this.success = success;
  }
}
