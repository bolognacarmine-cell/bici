'use server'

import fs from 'fs/promises';
import path from 'path';

export async function updateData(newData: any) {
  const filePath = path.join(process.cwd(), 'src', 'data.json');
  await fs.writeFile(filePath, JSON.stringify(newData, null, 2));
}
