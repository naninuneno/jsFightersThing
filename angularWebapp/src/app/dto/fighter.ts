export class Fighter {
  constructor(
    public id: number,
    public name: string,
    public koResultPercentage = 0,
    public koResultCount = 0,
    public subResultPercentage = 0,
    public subResultCount = 0,
    public decResultPercentage = 0,
    public decResultCount = 0) {
  }
}
