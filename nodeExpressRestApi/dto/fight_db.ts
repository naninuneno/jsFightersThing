export class DbFight {
  constructor(
    public id: number,
    public fighter1: number,
    public fighter2: number,
    public weightClass: string,
    public result: string,
    public round: number,
    public time: string,
    public event: number) {
  }
}
