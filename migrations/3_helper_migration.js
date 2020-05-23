var Helper = artifacts.require("Helper");

module.exports = function (deployer) {
    // deployment steps
    deployer.deploy(Helper);
};
