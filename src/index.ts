#!/usr/bin/env node
import * as cipher from "./cipher";
import * as fs from "fs";
import * as readline from "readline";
import * as util from "util";

const openFile = util.promisify(fs.open);
const closeFile = util.promisify(fs.close);
const read = util.promisify(fs.read);
const write = util.promisify(fs.write);

const args = process.argv.slice(2);
const filename = args[0];

const CHUNK_SIZE = Number(process.env["CHUNK_SIZE"]) || 100000;

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

  const outputFilename = `${filename}.ciph`;
  let file: number | undefined = undefined;
  let outputFile: number | undefined = undefined;

  try {
    file = await openFile(filename, "r");
    outputFile = await openFile(outputFilename, "w");
  } catch{
    console.log("Hay un problema con el archivo :(");
    process.exit(1);
  }

  const readBuffer = Buffer.alloc(CHUNK_SIZE);
  const writeBuffer = Buffer.alloc(CHUNK_SIZE);

  const state = cipher.buildInternalState(key, iv);

  let dataLength = 0;

  let { bytesRead } = await read(file as number, readBuffer, 0, CHUNK_SIZE, null);
  while (bytesRead !== 0) {
    cipher.encryptBuffer(readBuffer, writeBuffer, state, bytesRead);
    write(outputFile as number, writeBuffer, 0, bytesRead);
    bytesRead = (await read(file as number, readBuffer, 0, CHUNK_SIZE, null)).bytesRead;
    dataLength += CHUNK_SIZE;
  }

  await Promise.all([closeFile(file as number), closeFile(outputFile as number)]);

  const end = process.hrtime(start);
  console.log(`\nArchivo cifrado en ${outputFilename}`);
  console.log(`Cifrados ${humanFileSize(dataLength)} en %ds %dms`, end[0], end[1] / 1000000);
  console.log(`Velocidad: ${(dataLength * 8 / (end[0] + end[1] / 1e9)) / 1e6} Mbps`);

  process.exit(0);
}

processFile(filename);