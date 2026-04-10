export class GpxImportCancelledError extends Error {
  constructor() {
    super("User cancelled GPX import");
    this.name = "GpxImportCancelledError";
  }
}
