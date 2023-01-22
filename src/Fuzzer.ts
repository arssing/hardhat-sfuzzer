import { PowerSchedule } from "./PowerSchedule";
import { Seed } from "./Seed";
import { Mutator } from "./Mutator";
import { getRandomInt } from "./utils";
import { getCoverageFromMatrix } from "./utils";
import { createLogger, transports, format } from "winston";
const coverage = createLogger({
  level: 'info',
  transports: [
    new transports.File({ filename: 'coverage.log' }),
  ],
});
class Fuzzer {
  seeds: Array<Seed>;
  mutator: Mutator;
  schedule: PowerSchedule;
  population: Array<Seed>;
  seedIndex: number;
  inputs: any = [];
  current: Seed = new Seed([], [], []);
  coverageArray: Array<any> = [];

  constructor(seeds: Array<Seed>, mutator: Mutator, schedule: PowerSchedule) {
    this.seeds = seeds;
    this.mutator = mutator;
    this.schedule = schedule;
    this.population = [];
    this.seedIndex = 0;
    this.inputs
  }
  reset() {
    this.population = [];
    this.seedIndex = 0;
  }
  createCandidate() {
    let seed = this.schedule.choose(this.population);
    let candidate = seed.clone();

    let trials = getRandomInt(1, 5);
    for (let i = 0; i < trials; i++) {
      candidate = this.mutator.mutate(candidate);
    }
    return candidate;
  }

  fuzz() {
    if (this.seedIndex < this.seeds.length) {
      this.current = this.seeds[this.seedIndex];
      this.seedIndex += 1;
    } else {
      this.current = this.createCandidate();
    }
    this.inputs.push(this.current);
    return this.current;
  }

  checkCoverage(contractName: string) {
    let newCov = getCoverageFromMatrix();
    newCov = newCov[Object.keys(newCov)[0]];
    let a = JSON.stringify(newCov);
    let b = JSON.stringify(this.coverageArray);

    if (b.indexOf(a) === -1) {
      this.current.coverage.add(a);
      this.coverageArray.push(newCov);
      this.population.push(this.current);
      coverage.info(`${new Date().getTime() / 1000}:${this.coverageArray}`)
    }
  }
}

export { Fuzzer }