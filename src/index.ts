#!/usr/bin/env node
import * as cipher from "./cipher";
import * as fs from "fs";
import * as readline from "readline";
import * as util from "util";

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const args = process.argv.slice(2);
const filename = args[0];

function humanFileSize(bytes: number, si: boolean = false) {
  const thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }
  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + " " + units[u];
}

async function processFile(filename: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const question = (query: string) => {
    return new Promise((resolve: (answer: string) => void) => {
      rl.question(query, resolve);
    });
  };

  console.log(`Encriptando ${filename}`);

  const key = await question("Ingrese la clave ultrasecreta: ");
  console.log(`Clave: ${key}`);

  const iv = await question("Ingrese el IV: ");
  console.log(`IV: ${iv}`);

  const start = process.hrtime();

  let file: Buffer | undefined;

  try {
    file = await readFile(filename);
  } catch{
    file = undefined;
    console.log("Hay un problema con el archivo :(");
    process.exit(1);
  }

  const cipherData = cipher.cipher(file as Buffer, key, iv);
  const outputFile = `${filename}.ciph`;
  await writeFile(outputFile, cipherData);

  const end = process.hrtime(start);
  console.log(`\nArchivo cifrado en ${outputFile}`);
  console.log(`Cifrados ${humanFileSize(cipherData.length)} en %ds %dms`, end[0], end[1] / 1000000);
  console.log(`Velocidad: ${(cipherData.length * 8 / (end[0] + end[1] / 1e9)) / 1e6} Mbps`);

  process.exit(0);
}

processFile(filename);