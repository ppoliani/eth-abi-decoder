const Web3 = require('web3');

let savedABIs = [];
const methodIDs = {};

const web3 = new Web3();

const addABI = abiArray => {
  if (Array.isArray(abiArray)) {
    abiArray.map(abi => {
      if(abi.name){
        const signature = web3.eth.abi.encodeFunctionSignature(abi);

        if(abi.type === 'event'){
          methodIDs[signature.slice(2)] = abi;
        }
        else {
          methodIDs[signature.slice(2, 10)] = abi;
        }
      }
    });

    savedABIs = savedABIs.concat(abiArray);
  }
  else {
    throw new Error('Expected ABI array, got ' + typeof abiArray);
  }
}

const wrapParamInfo = (name, type, components) => ({name, type, components})
const getArrayType = type => type.replace('[]', '');

const decodeParam = (paramInfo, value) => {
  const {components, type} = paramInfo;
  let parsedValue;

  if(type.endsWith('[]')) {
    parsedValue =  value.map((v, i) => decodeParam(wrapParamInfo(i, getArrayType(type), components), v));
  }
  else if(type === 'tuple') {
    parsedValue = components.map(c => {
      const isTuple = value[c.name] !== undefined;

      if(isTuple) {
        return decodeParam(c, value[c.name])
      }
      else {
        return value.map((v, i) => decodeParam(wrapParamInfo(i, 'tuple'), v))
      }
    })
  }
  else if(type === 'bytes32') {
    try {
      parsedValue = web3.utils.hexToUtf8(value);
    }
    catch(error) {
      parsedValue = value
    }
  }
  else if(type.startsWith('uint') || type.startsWith('int')) {
    parsedValue = web3.utils.toBN(value).toString();
  }
  else {
    parsedValue = value
  }

  return {
    name: paramInfo.name,
    value: parsedValue,
    type: paramInfo.type
  };
}

const decodeMethod = data => {
  const methodID = data.slice(2, 10);
  const abiItem = methodIDs[methodID];

  if (abiItem) {
    const decoded = web3.eth.abi.decodeParameters(abiItem.inputs, data.slice(10));

    return {
      name: abiItem.name,
      params: abiItem.inputs.map(paramInfo => decodeParam(paramInfo, decoded[paramInfo.name]))
    }
  }
}

module.exports = {addABI, decodeMethod}
