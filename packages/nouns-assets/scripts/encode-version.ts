import { PNGCollectionEncoder } from '@nouns/sdk';
import { promises as fs, existsSync, readFileSync } from 'fs';
import path from 'path';
import { readPngImage } from './utils';

const getExistingPalette = (version: string) => {
  const previousversion = Number(version.replace(/\D/g, '')) - 1;
  const previousversionfile = path.join(
    __dirname,
    '../src',
    `image-data-v${previousversion}-additions.json`,
  );

  if (existsSync(previousversionfile)) {
    return JSON.parse(readFileSync(previousversionfile, { encoding: 'utf8' })).palette;
  }
  return [];
};

const encode = async (version: string) => {
  const versionfolder = path.join(__dirname, '../images', version);
  if (!existsSync(versionfolder)) {
    throw new Error(`Unknown art version: ${version}`);
  }

  const destination = path.join(__dirname, `../src/image-data-${version}-additions.json`);
  const palette = getExistingPalette(version);
  const encoder = new PNGCollectionEncoder(palette);

  const partfolders = ['1-bodies', '2-accessories', '3-heads', '4-glasses'];
  for (const folder of partfolders) {
    const folderpath = path.join(__dirname, '../images', version, folder);
    const files = await fs.readdir(folderpath);
    for (const file of files) {
      if (file === '.gitkeep') {
        continue;
      }
      const image = await readPngImage(path.join(folderpath, file));
      encoder.encodeImage(file.replace(/\.png$/, ''), image, folder.replace(/^\d-/, ''));
    }
  }
  await fs.writeFile(
    destination,
    JSON.stringify(
      {
        bgcolors: ['d5d7e1', 'e1d7d5'],
        ...encoder.data,
      },
      null,
      2,
    ),
  );
};

encode(process.argv[2]);
