import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:5000/api';

export const handlers = [
  // Authentication mocks
  http.post(`${API_URL}/auth/login`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Login bem-sucedido',
      token: 'fake-jwt-token',
      data: {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      }
    });
  }),
  
  http.get(`${API_URL}/auth/me`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      }
    });
  }),

  // Products mocks
  http.get(`${API_URL}/products`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          _id: 'prod1',
          name: 'Top Fitness',
          price: 99.9,
          images: ['url-image.jpg'],
          category: 'Top'
        }
      ],
      totalPages: 1,
      currentPage: 1
    });
  }),

  // Orders mocks
  http.get(`${API_URL}/orders`, () => {
    return HttpResponse.json({
      success: true,
      data: []
    });
  })
];
