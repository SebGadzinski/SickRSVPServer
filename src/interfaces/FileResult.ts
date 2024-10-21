/**
 * @file Used with mutler
 * @author Sebastian Gadzinski
 */

import multer from 'multer';

export default interface FileResult {
  file: multer.File;
  errors: object;
}
