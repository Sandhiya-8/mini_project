const ContextAwareAccessControl = artifacts.require("ContextAwareAccessControl");

module.exports = function (deployer) {
    deployer.deploy(ContextAwareAccessControl);
};
