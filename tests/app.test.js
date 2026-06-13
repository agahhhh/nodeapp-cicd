// tests/app.test.js
const request = require('supertest');
const app = require('../src/app');

describe('App routes', () => {
  test('GET / should return index.html', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });
});