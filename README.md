# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:

https://gist.github.com/jtrefry/fd0ea70a89e2c3b7779c

npm install --global --production windows-build-tools
(be sure to run as admin)
npm config set msvs_version 2017 --global

'npm i --save ethereum/web3.js'
`npm install`
`truffle compile`

ganache-cli -a 50 -l 9999999 -m "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"

## Develop Client

To run truffle tests:

`truffle test ./test/flightSurety.js`
`truffle test ./test/oracles.js`

To use the dapp:

`truffle migrate`
npm uninstall webpack webpack-cli webpack-dev-server
npm install --save-dev webpack@latest webpack-cli@latest webpack-dev-server@latest
`npm run dapp`

To view dapp:

`http://localhost:8000`

## Develop Server
be sure to run bash
`npm run server`
`truffle test ./test/oracles.js`

## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder

# test Data, using above Ganache
Owner: 0x627306090abaB3A6e1400e9345bC60c78a8BEf57

Passenger: 0x69e1CB5cFcA8A311586e3406ed0301C06fb839a2

this.config.appAddress: 0x38cF23C52Bb4B13F051Aec09580a2dE845a7FA35


Airlines: 
0x627306090abaB3A6e1400e9345bC60c78a8BEf57
    Flights + Date
    '123' - "2019-06-12"
    '231' - "2019-06-13"
    '334' - "2019-06-15"
0xf17f52151EbEF6C7334FAD080c5704D77216b732
    Flights + Date
    '111' - "2019-06-12"
    '222' - "2019-06-13"
    '333' - "2019-06-15"
0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef
    Flights + Date
    '321' - "2019-06-12"
    '223' - "2019-06-13"
    '012' - "2019-06-15"
0x821aEa9a577a9b44299B9c15c88cf3087F3b5544
    Flights + Date
    '577' - "2019-06-12"
    '632' - "2019-06-13"
    '010' - "2019-06-15"
    
## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)