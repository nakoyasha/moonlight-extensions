// https://moonlight-mod.github.io/ext-dev/cookbook/#extension-entrypoints
const logger = moonlightNode.getLogger("colorful");
logger.info("Hello from Node!");
module.exports = "Hello from Node's exports!";