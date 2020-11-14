const { select } = require('./supplier');

async function main() {
  const serve = await select();

  try {

    const best = await serve({x:1, y:70});
    console.log(`Supplier ${best.name} is the best.`);
    
  } catch (err) {
    console.log(err);
  }
}

main().then(
  () => process.exit(0)
);