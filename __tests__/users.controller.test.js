const User = require('../models/User');
const usersController = require('../controllers/users');

jest.mock('../models/User', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}));

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

const sampleUser = {
  _id: '66f5a1b2c3d4e5f6a7b8c902',
  githubId: '123456',
  username: 'daniel257p',
  displayName: 'Daniel Paulino',
  email: 'daniel@example.com',
  role: 'admin'
};

describe('Users controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('returns 200 and the list of users', async () => {
      User.find.mockResolvedValue([sampleUser]);
      const res = mockResponse();

      await usersController.getAll({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([sampleUser]);
    });

    test('returns 500 when the database fails', async () => {
      User.find.mockRejectedValue(new Error('DB down'));
      const res = mockResponse();

      await usersController.getAll({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getMe', () => {
    test('returns 401 when nobody is logged in', async () => {
      const req = { session: {} };
      const res = mockResponse();

      await usersController.getMe(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(User.findById).not.toHaveBeenCalled();
    });

    test('returns 200 and the logged-in user', async () => {
      User.findById.mockResolvedValue(sampleUser);
      const req = { session: { user: { _id: sampleUser._id } } };
      const res = mockResponse();

      await usersController.getMe(req, res);

      expect(User.findById).toHaveBeenCalledWith(sampleUser._id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(sampleUser);
    });

    test('returns 404 when the logged-in user no longer exists', async () => {
      User.findById.mockResolvedValue(null);
      const req = { session: { user: { _id: sampleUser._id } } };
      const res = mockResponse();

      await usersController.getMe(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getSingle', () => {
    test('returns 200 and the user when it exists', async () => {
      User.findById.mockResolvedValue(sampleUser);
      const req = { params: { id: sampleUser._id } };
      const res = mockResponse();

      await usersController.getSingle(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(sampleUser);
    });

    test('returns 404 when the user does not exist', async () => {
      User.findById.mockResolvedValue(null);
      const req = { params: { id: sampleUser._id } };
      const res = mockResponse();

      await usersController.getSingle(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateUser', () => {
    test('returns 200 and only sends the fields provided', async () => {
      User.findByIdAndUpdate.mockResolvedValue(sampleUser);
      const req = { params: { id: sampleUser._id }, body: { role: 'production' } };
      const res = mockResponse();

      await usersController.updateUser(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        sampleUser._id,
        { role: 'production' },
        { runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns 404 when the user does not exist', async () => {
      User.findByIdAndUpdate.mockResolvedValue(null);
      const req = { params: { id: sampleUser._id }, body: { role: 'production' } };
      const res = mockResponse();

      await usersController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteUser', () => {
    test('returns 204 when the user is deleted', async () => {
      User.findByIdAndDelete.mockResolvedValue(sampleUser);
      const req = { params: { id: sampleUser._id } };
      const res = mockResponse();

      await usersController.deleteUser(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    test('returns 404 when the user does not exist', async () => {
      User.findByIdAndDelete.mockResolvedValue(null);
      const req = { params: { id: sampleUser._id } };
      const res = mockResponse();

      await usersController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
