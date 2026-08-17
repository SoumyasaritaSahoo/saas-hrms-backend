import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, unlink } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Single seam between business logic and the file storage backend.
 * Everything here is local-disk specific; swapping to S3 later means
 * replacing this class's internals (or providing an S3 implementation
 * behind the same `save`/`delete` signatures) — nothing outside this
 * file needs to change.
 */
@Injectable()
export class StorageService {
  private readonly publicRoot = join(process.cwd(), 'public');

  async save(
    buffer: Buffer,
    originalName: string,
    subfolder: string,
  ): Promise<string> {
    const dir = join(this.publicRoot, 'uploads', subfolder);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const safeName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filename = `${randomUUID()}-${safeName}`;
    await writeFile(join(dir, filename), buffer);

    return `/uploads/${subfolder}/${filename}`;
  }

  async delete(relativePath: string | null | undefined): Promise<void> {
    if (!relativePath || !relativePath.startsWith('/uploads/')) return;
    const absolutePath = join(this.publicRoot, relativePath);
    unlink(absolutePath, () => {});
  }
}
