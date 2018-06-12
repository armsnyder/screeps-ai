export default class Lazy<T> {
  private value: T | undefined;
  private readonly initializer: () => T;

  constructor(initializer: () => T) {
    this.initializer = initializer;
  }

  public get(): T {
    if (!this.value) {
      this.value = this.initializer();
    }
    return this.value;
  }
}
