var Battleship = artifacts.require("Battleship");

module.exports = function (deployer) {
    // deployment steps
    deployer.deploy(Battleship, {gas: 6000000});
};
