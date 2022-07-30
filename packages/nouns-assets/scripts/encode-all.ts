import { PNGCollectionEncoder } from '@nouns/sdk';
import { promises as fs, readdirSync } from 'fs';
import path from 'path';
import { readPngImage } from './utils';

const DESTINATION = path.join(__dirname, '../src/image-data.json');

const encode = async () => {
  const encoder = new PNGCollectionEncoder();

  const imagefolder = path.join(__dirname, '../images');
  const versionfolders = readdirSync(imagefolder, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);
  const partfolders = ['1-bodies', '2-accessories', '3-heads', '4-glasses'];
  for (const version of versionfolders) {
    for (const folder of partfolders) {
      const folderpath = path.join(imagefolder, version, folder);
      const files = await fs.readdir(folderpath);
      for (const file of files) {
        if (file === '.gitkeep') {
          continue;
        }
        const image = await readPngImage(path.join(folderpath, file));
        encoder.encodeImage(file.replace(/\.png$/, ''), image, folder.replace(/^\d-/, ''));
      }
    }
  }
  await fs.writeFile(
    DESTINATION,
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

encode();
