import { EventEmitter } from "events";

export class Handle<T> {
  private value: T;
  private eventEmitter = new EventEmitter();

  constructor(value: T) {
    this.value = value;
  }

  currentValue() {
    return Object.freeze(this.value);
  }

  update(updateState: (currentValue: Readonly<T>) => T): void {
    this.value = updateState(this.currentValue());
    this.eventEmitter.emit("value", this.currentValue());
  }

  onValue(listener: (value: Readonly<T>) => void): void {
    this.eventEmitter.on("value", listener);
  }

  offValue(listener: (value: Readonly<T>) => void): void {
    this.eventEmitter.off("value", listener);
  }
}
