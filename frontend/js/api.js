const API = {
  base: '/api',

  token() { return localStorage.getItem('token'); },

  headers(isForm = false) {
    const h = { 'Authorization': `Bearer ${this.token()}` };
    if (!isForm) h['Content-Type'] = 'application/json';
    return h;
  },

  async request(method, path, body = null, isForm = false) {
    const opts = { method, headers: this.headers(isForm) };
    if (body) opts.body = isForm ? body : JSON.stringify(body);
    const res = await fetch(this.base + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  get(path)         { return this.request('GET', path); },
  post(path, body)  { return this.request('POST', path, body); },
  put(path, body)   { return this.request('PUT', path, body); },
  patch(path, body) { return this.request('PATCH', path, body); },
  del(path)         { return this.request('DELETE', path); },
  upload(path, fd)  { return this.request('POST', path, fd, true); },
};
