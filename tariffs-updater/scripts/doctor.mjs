import process from 'node:process';

const minNodeMajor = 18;
const [major, minor, patch] = process.versions.node.split('.').map(Number);

if (major < minNodeMajor) {
  console.error(`Node ${process.versions.node} detected. Please use Node >= 18.17.`);
  process.exit(1);
} else {
  console.log(`Node ${process.versions.node} OK.`);
}