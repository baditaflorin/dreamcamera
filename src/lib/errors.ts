export class DreamcameraError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "DreamcameraError";
  }
}

export function messageFromError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something unexpected happened.";
}
