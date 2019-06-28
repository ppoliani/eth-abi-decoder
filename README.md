# eth-abi-decoder
Ethereum transaction raw data decoder


# Install 

```
npm install eth-abi-decoder
yarn add eth-abi-decoder
```

# Decode transaction input data

```
const {addABI, decodedData} = require('eth-abi-decoder')
// 1. Add the Abstract Binary Interface
addABI(abi);

// 2. Decode the input data
const decodedData = decodeMethod(data);
```
