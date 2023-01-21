class Oracle {
  prevValue: string;
  
  constructor(prevValue: string) {
    this.prevValue = prevValue;
  }

  isEqual(newValue: string) {
    if (newValue !== this.prevValue) return false;
    return true;
  }
}

export { Oracle }