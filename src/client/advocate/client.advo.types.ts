import { z } from 'nestjs-zod/z';
import { ClientAdvoFilterBodySchema } from './client.advo.zod';

export type ClientAdvoFilterBodyTypes = z.infer<
  typeof ClientAdvoFilterBodySchema
>;
