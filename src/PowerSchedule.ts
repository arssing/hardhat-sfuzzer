import { Seed } from "./Seed";


class PowerSchedule {
  assignEnergy(population: Array<Seed>) {
    for (let seed of population) seed.energy = 1;
  }
  normalizedEnergy(population: Array<Seed>) {
    let energy = population.map((seed: Seed) => seed.energy)
    const sumEnergy = energy.reduce((accumulator, current) => {
      return accumulator + current;
    }, 0);
    if (sumEnergy === 0) throw "Sum energy === 0";
    let normEnergy = energy.map((n) => n/sumEnergy);
    return normEnergy
  }

  choose(population: Array<Seed>): Seed{
    this.assignEnergy(population);
    let normEnergy = this.normalizedEnergy(population);
    let seed = weightRandom(population, normEnergy);
    return seed
  }
}

function weightRandom(items: Array<any>, weights: Array<number>) {
  let s = 0;
  let num = Math.random();
  let lastIndex = weights.length - 1;

  for (var i = 0; i < lastIndex; ++i) {
      s += weights[i];
      if (num < s) {
          return items[i];
      }
  }
    return items[lastIndex];
}

export {PowerSchedule};