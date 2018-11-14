class MiddleSquarePRNG {

  constructor() {
    let defaultNumber = Date.now();
    this.seed = defaultNumber.toString();
  }

  setSeed(newSeed) {

    this.seed = newSeed.toString();
  }

  getMiddleNumber(num, sizeOfMiddle) {
    let str = num.toString();
    let hasEvenPadding = false;
    while(str.length < this.seed.length*2) {
        str = "0" + str;
    }

    let sizeOfPadding = (str.length - sizeOfMiddle)/2
    let middleNumber = str.slice(sizeOfPadding, sizeOfPadding+sizeOfMiddle);

    return middleNumber
  }

  generateNewNumber(unitInterval = false) {

    let bufferSeed = Math.pow(this.seed, 2);
    let re = /(?<=e\+)\d+/;
    let exp = parseInt(bufferSeed.toExponential().match(re)[0]);
    bufferSeed = bufferSeed.toPrecision(exp + 1);
    this.setSeed(this.getMiddleNumber(bufferSeed, this.seed.length));

    if(!unitInterval) {
      return this.seed;
    }
    else if(unitInterval) {
      return parseInt(this.seed)/Math.pow(10,this.seed.length);
    }
  }

  random() {
    for(let i = 0; i<100; i++) {
      this.generateNewNumber();
    }
    return parseInt(this.seed)/Math.pow(10,this.seed.length);
  }


  getPeriod(){

      let initialSeed = this.seed;
      let seenBefore = [initialSeed];
      let period = 0;

      while(!seenBefore.includes(this.generateNewNumber().toString())) {
        period++;
        seenBefore.push(this.seed);
      }
      seenBefore.push(this.seed);
      if(!(seenBefore[period+1] === initialSeed)) {
        this.seed = initialSeed;
        return false;
      }


      this.seed = initialSeed
      return period + 2;
  }

  getPeriodList() {
    let initialSeed = this.seed;
    let period = this.getPeriod();
    let periodList = [this.seed];
    for(let i = 0; i<= period-2; i++) {
      periodList.push(this.generateNewNumber());
    }

    this.seed = initialSeed;
    return periodList;
  }

  findPeriod(desiredPeriodLength, smallEnd = 0, largeEnd = 1000, decaysAllowed = true, numOfDigits) {
    let initialSeed = this.seed;
    let matchingSeeds = [];

    for(let i = smallEnd; i < largeEnd; i++) {
      if(i%1000 === 0) {
        console.log(i);
      }
      initialSeed = this.seed;
      this.setSeed(i);
      
      if(numOfDigits) {
        while(this.seed.length < numOfDigits) {
          this.seed = "0" + this.seed;
        }
      }
      let periodLength = this.getPeriod();
      if(periodLength && periodLength === desiredPeriodLength) {
        console.log("found new seed = " + this.seed);
        matchingSeeds.push(this.seed);
      }
    }

    if(matchingSeeds[0]) {
      this.seed = initialSeed;
      return matchingSeeds;
    }
    else if(!matchingSeeds[0]) {
      this.seed = initialSeed;
      return false;
    }
  }


}


function printAllElements(arr) {
  for(let i = 0; i<arr.length; i++) {
    console.log(arr[i]);
  }
}

// example use of MiddleSquarePRNG class
let PRNG = new MiddleSquarePRNG();

// period inclusive, low search range, high search range, decays allowed?, number of digits in random numbers
let periodList = [];

let smallEnd = 10000;
let bigEnd = 100000;
let functionRan = false;
let desiredPeriodLength = 5;
let numOfDigits = 0;
let periodsInRange = [];
let remainderAfter = bigEnd;
let lowEndAtEnd = smallEnd;

for(let j = smallEnd, i = getOrderOfMagnitude(smallEnd)*10; i<=bigEnd; i*=10) {
  console.log("range = [" + j + ", " + i + "]");
  numOfDigits = i.toString().length-1;
  if(numOfDigits % 2 !== 0) {
    numOfDigits++;
  }
  console.log("number of digits = " + numOfDigits);
  periodsInRange = PRNG.findPeriod(desiredPeriodLength, j, i, false, numOfDigits);
  if(periodsInRange) {
    periodList = periodList.concat(periodsInRange);
  }

  remainderAfter = bigEnd - i;
  lowEndAtEnd = i;
  functionRan = true
  j = i;
}

if(lowEndAtEnd !== (lowEndAtEnd + remainderAfter) ) {
  numOfDigits = remainderAfter.toString().length-1;
  if(numOfDigits % 2 !== 0) {
    numOfDigits++;
  }
  console.log("number of digits = " + numOfDigits);
  if(functionRan) {
    console.log("range after = [" + lowEndAtEnd + ", " + (lowEndAtEnd + remainderAfter) + "]");
    periodsInRange = PRNG.findPeriod(desiredPeriodLength, lowEndAtEnd, lowEndAtEnd + remainderAfter, false, numOfDigits);
  }
  else if(!functionRan) {
    console.log("range after = [" + smallEnd + ", " + bigEnd + "]");
    periodsInRange = PRNG.findPeriod(desiredPeriodLength, smallEnd, bigEnd, false, numOfDigits);
  }
  if(periodsInRange) {
    periodList = periodList.concat(periodsInRange);
  }
}

console.log("Period list for " + desiredPeriodLength);
console.log(periodList);
printAllElements(periodList);

function getOrderOfMagnitude(num) {
  return 10**(num.toString().length-1)
}

// need to be able to reach artitrary end points from arbitrary start points (including zero...);
// need to start experimenting with paralell forms of computation.