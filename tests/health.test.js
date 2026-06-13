const request = require('supertest');
const app     = require('../src/app.js');
 
describe('GET /health', () => {
  it('returns status ok with a timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});