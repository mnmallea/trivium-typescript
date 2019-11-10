#!/usr/bin/env node
import * as trivium from "./trivium";
import * as cipher from "./cipher";
import * as fs from "fs";
import * as readline from "readline";
import * as util from "util";

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const args = process.argv.slice(2);
const filename = args[0];

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

  let file: Buffer | undefined;

  try {
    file = await readFile(filename);
  } catch{
    file = undefined;
    console.log("Hay un problema con el archivo :(");
    process.exit(1);
  }

  console.log(`Encriptando ${filename}`);

  const key = await question("Ingrese la clave ultrasecreta: ");
  console.log(`Clave: ${key}`);

  const iv = await question("Ingrese el IV: ");
  console.log(`IV: ${iv}`);

  const cipherData = cipher.cipher(file as Buffer, key, iv);
  const outputFile = `${filename}.ciph`;
  await writeFile(outputFile, cipherData);

  console.log(`Output sent to ${outputFile}`);

  process.exit(0);
}

processFile(filename);