import { create } from 'axios';

import { API_URL } from './config';

export const cliente = create({ baseURL: API_URL, timeout: 10000 });
