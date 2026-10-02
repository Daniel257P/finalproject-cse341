const User = require('../models/User');

const getAll = async (req, res) => {
  //#swagger.tags=['Users']
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Some error occurred while retrieving users.', error: err.message });
  }
};

const getMe = async (req, res) => {
  //#swagger.tags=['Users']
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Some error occurred while retrieving the user.', error: err.message });
  }
};

const getSingle = async (req, res) => {
  //#swagger.tags=['Users']
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Some error occurred while retrieving the user.', error: err.message });
  }
};

const updateUser = async (req, res) => {
  //#swagger.tags=['Users']
  try {
    const user = {
      username: req.body.username,
      displayName: req.body.displayName,
      email: req.body.email,
      role: req.body.role
    };
    Object.keys(user).forEach((key) => user[key] === undefined && delete user[key]);

    const response = await User.findByIdAndUpdate(req.params.id, user, { runValidators: true });
    if (!response) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Some error occurred while updating the user.', error: err.message });
  }
};

const deleteUser = async (req, res) => {
  //#swagger.tags=['Users']
  try {
    const response = await User.findByIdAndDelete(req.params.id);
    if (!response) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(204).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Some error occurred while deleting the user.', error: err.message });
  }
};

module.exports = {
  getAll,
  getMe,
  getSingle,
  updateUser,
  deleteUser
};
