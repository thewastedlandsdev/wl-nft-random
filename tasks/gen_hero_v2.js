const VERSION = 2;
// let models = require("../models");
const utils = require("../utils/utils");
const PartData = require("../data/parts.json")
let heroCount = 0;
const PackageConfig = require("../data/package_config.json")
const PartIds = ["Body", "Head", "Left Arm", "Right Arm", "Left Leg", "Right Leg"]


let getPartByMaxRarity = (gender, maxRarity) => {
  let result = PartData.filter(x => x.gender == gender);
  if (maxRarity) {
    result = result.filter(x => x.rarity <= maxRarity);
  }
  return result;
}


let getPartByRarity = (gender, maxRarity) => {
  let result = PartData.filter(x => x.gender == gender);
  if (maxRarity) {
    result = result.filter(x => x.rarity == maxRarity);
  }
  return result;
}

let takePartFromRandom = (partCount) => {
  let newIds = []
  let set = [...PartIds]
  if (partCount === PartIds.length){
    return set
  }else{
    for (let i = 0; i <partCount; i++) {
      let randomIndex = utils.getRandomInt(0, set.length - 1);
      let p = set[randomIndex]
      newIds.push(p)
      set.splice(randomIndex, 1)
    }
    return newIds
  }
}

let takeOtherParts = (currentParts) => {
  let newIds = []
  for (let i = 0; i <PartIds.length; i++) {
    if (!currentParts.includes(PartIds[i])){
      newIds.push(PartIds[i])
    }
  }
  return newIds
}

let getPartByMinRarity = (gender, minRarity) => {
  let result = PartData.filter(x => x.gender == gender);
  if (minRarity) {
    result = result.filter(x => x.rarity >= minRarity);
  }
  return result;
}

let takePartType = (parts, type, rarity) => {
  let partWithType
  if (rarity){
    partWithType = parts.filter(x => x.type == type && x.rarity == rarity);
  }else{
    partWithType = parts.filter(x => x.type == type);
  }
  let random = utils.getRandomInt(0, partWithType.length - 1);
  return partWithType[random];
}

let takePartInSet = (partType, set) => {
  let partWithType = set.filter(x => x.type == partType);
  let random = utils.getRandomInt(0, partWithType.length - 1);
  return partWithType[random];
}


let genRandomGen = (part) => {
  let filter = PartData.filter(x => x.type == part.type && x.gender == part.gender && x.rarity <= part.rarity);
  let random = utils.getRandomInt(0, filter.length - 1);
  let result = filter[random];
  return {
    part_id: result.part_id,
    name_code: result.name_code,
    rarity: result.rarity,
    gen: result.gen
  }
}


let genHeroWithData = async (gender, maxRarityParts, otherParts, setAllParts, setLowerParts) =>{
  let dict = {}
  for(let part of maxRarityParts){
    dict[part] = takePartInSet(part, setAllParts)
  }
  for(let part of otherParts){
    dict[part] = takePartInSet(part, setLowerParts)
  }

  let body = dict["Body"]
  let head = dict["Head"]
  let leftArm = dict["Left Arm"];
  let rightArm = dict["Right Arm"];
  let leftLeg = dict["Left Leg"];
  let rightLeg = dict["Right Leg"];

  let data = {
    character: body.character,
    class: body.part_class,
    faction: body.faction,
    gender: gender,
    rarity: body.rarity,
    body_id: body,
    head_id: head,
    left_arm: leftArm,
    right_arm: rightArm,
    left_leg: leftLeg,
    right_leg: rightLeg,
    r1: {
      body_id: genRandomGen(body),
      head_id: genRandomGen(head),
      left_arm: genRandomGen(leftArm),
      right_arm: genRandomGen(rightArm),
      left_leg: genRandomGen(leftLeg),
      right_leg: genRandomGen(rightLeg),
    },
    r2: {
      body_id: genRandomGen(body),
      head_id: genRandomGen(head),
      left_arm: genRandomGen(leftArm),
      right_arm: genRandomGen(rightArm),
      left_leg: genRandomGen(leftLeg),
      right_leg: genRandomGen(rightLeg),
    }
  }
  console.log(`Gen Hero: body ${body.rarity}, head ${head.rarity}, left arm ${leftArm.rarity}, right arm ${rightArm.rarity}, left leg ${leftLeg.rarity}, right leg ${rightLeg.rarity}`)
  return data;
}

let genHero = async (gender, maxRarity, partCount) => {
  let allPartWithRarity = getPartByRarity(gender, maxRarity)
  let partWithMaxRarity = takePartFromRandom(partCount)
  let otherParts = takeOtherParts(partWithMaxRarity)
  let allPartLowerRarity = getPartByMaxRarity(gender, maxRarity - 1)
  let data = await genHeroWithData(gender,partWithMaxRarity, otherParts, allPartWithRarity, allPartLowerRarity)
  return data
}

let genHeroOnPackageSet = async (setConfig) => {
  let maxRarity = setConfig.part_rarity;
  let partCount = setConfig.min_part;
  let volume = setConfig.volume;
  console.log(`Gen hero => Rarity: ${maxRarity}, PartCount: ${partCount}, Volume: ${volume}`)
  for (let i = 0; i < volume; i++) {
    let gender = utils.getRandomInt(0, 1) < 1 ? "Male" : "Female"
    let data = await genHero(gender, maxRarity, partCount)
    // console.log(data)
    heroCount++;
    console.log("Hero Count:", heroCount)
    await saveHeroNft(data, heroCount, setConfig.package)
  }
}

let saveHeroNft = async (data, heroCount, package) => {
  let heroData = {
    hero_id: heroCount,
    version: VERSION,
    character: data.character,
    class: data.class,
    faction: data.faction,
    gender: data.gender == "Male" ? 0 : 1,
    package: package,
    rarity: data.rarity,
    body_id: data.body_id.part_id,
    head_id: data.head_id.part_id,
    left_arm: data.left_arm.part_id,
    right_arm: data.right_arm.part_id,
    left_leg: data.left_leg.part_id,
    right_leg: data.right_leg.part_id,
    r1: {
      body_id: data.r1.body_id.gen,
      head_id: data.r1.head_id.gen,
      left_arm: data.r1.left_arm.gen,
      right_arm: data.r1.right_arm.gen,
      left_leg: data.r1.left_leg.gen,
      right_leg: data.r1.right_leg.gen,
    },
    r2: {
      body_id: data.r2.body_id.gen,
      head_id: data.r2.head_id.gen,
      left_arm: data.r2.left_arm.gen,
      right_arm: data.r2.right_arm.gen,
      left_leg: data.r2.left_leg.gen,
      right_leg: data.r2.right_leg.gen,
    }
  };
  // await models.BaseHeroNFT.create(data);
  console.log(heroData)
}

let runMain = async () => {
  console.log("Start gen...")
  for (let i = 1; i <= 4; i++) {
    let packageSet = PackageConfig.filter( x => x.package === i);
    for(let t=0; t < packageSet.length; t++){
      await genHeroOnPackageSet(packageSet[t])
    }
  }
  console.log("DONE!")
}

module.exports = {
  GenWastedLandHeroes: runMain
};

