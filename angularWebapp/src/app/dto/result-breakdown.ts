export class ResultBreakdown {
  constructor(
    public koCount: number,
    public subCount: number,
    public decCount: number,
    public koPercentage: number,
    public subPercentage: number,
    public decPercentage: number) {
  }

  private static getWeighting(percentage: number, count: number) {
    return (percentage / 100) * count;
  }

  getKoWeighting() {
    return ResultBreakdown.getWeighting(this.koPercentage, this.koCount);
  }

  getSubWeighting() {
    return ResultBreakdown.getWeighting(this.subPercentage, this.subCount);
  }

  getDecWeighting() {
    return ResultBreakdown.getWeighting(this.decPercentage, this.decCount);
  }
}
