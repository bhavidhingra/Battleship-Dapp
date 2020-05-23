const Helper = artifacts.require("Helper");

let helper;

contract('Helper', () => {
    beforeEach(async () => {
        helper = await Helper.deployed();
    });
    it('Check commitment generation for (0, 1234)', async() => {
        commitment = await helper.generate_commitment.call(0, 1234);
        assert(commitment == "0x9518dce19d5200cd2e738fe79e0ac8a37ec05fbca94fb1b2452def0c80ec33e9", "Incorrect commitment generated");
    });
    it('Check commitment generation for (1, 1234)', async() => {
        commitment = await helper.generate_commitment.call(1, 1234);
        assert(commitment == "0xec8ff7026f1ccaea8da66d7265de5bb383b020f591b5fb9dbc4a37c401d2f5fd", "Incorrect commitment generated");
    });
});