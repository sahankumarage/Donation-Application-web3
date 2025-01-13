require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    ganache: {
      url: "http://127.0.0.1:7545", 
      accounts: [
        "0x532363c965eeefba50d0f2cd537a54f22011bef6b341e89c246d1c8d037de550",
      ],
      chainId: 1337, 
    },
  },
};
