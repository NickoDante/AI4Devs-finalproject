/**
 * Mock básico para la API de Slack
 * Utilizado en pruebas de integración
 */
export const mockSlackApi = {
  chat: {
    postMessage: jest.fn().mockResolvedValue({ ok: true }),
    update: jest.fn().mockResolvedValue({ ok: true }),
    delete: jest.fn().mockResolvedValue({ ok: true })
  },
  users: {
    info: jest.fn().mockResolvedValue({
      ok: true,
      user: {
        id: 'U123456',
        name: 'testuser',
        real_name: 'Test User',
        profile: {
          email: 'test@example.com',
          display_name: 'testuser'
        }
      }
    })
  },
  channels: {
    list: jest.fn().mockResolvedValue({
      ok: true,
      channels: [
        { id: 'C123456', name: 'general' },
        { id: 'C654321', name: 'random' }
      ]
    }),
    history: jest.fn().mockResolvedValue({
      ok: true,
      messages: []
    })
  }
}; 