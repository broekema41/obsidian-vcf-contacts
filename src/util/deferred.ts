export class Deferred<T = void>  {
  public status: 'pending' | 'resolved' | 'rejected' = 'pending';
  public promise: Promise<T>;
  public resolve!: (value: T) => void;
  public reject!: (reason?: any) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = (value: T) => {
        this.status = 'resolved';
        resolve(value);
      };
      this.reject = (reason?: any) => {
        this.status = 'rejected';
        reject(reason);
      };
    });
  }
}
