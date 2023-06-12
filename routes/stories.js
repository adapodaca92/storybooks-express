const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');

const Story = require('../models/Story');

// @desc show add poage
// @route GET /stories/add

router.get('/add', ensureAuth, (req, res) => {
  res.render('stories/add');
});

// @desc process add form
// @route POST /stories

router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Story.create(req.body);
    res.redirect('/dashboard');
  } catch (err) {
    console.log(err);
    res.render('error/500');
  }
});

// @desc show all stories
// @route GET /stories

router.get('/', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'descending' })
      .lean();

    res.render('stories/index', {
      stories,
    });
  } catch (err) {
    console.log(err);
    res.render('error/500');
  }
});

// @desc show edit page
// @route GET /stories/edit/:id

router.get('/edit/:id', ensureAuth, async (req, res) => {
  const story = await Story.findOne({
    _id: req.params.id,
  }).lean();

  if (!story) {
    return res.render('error/404');
  }

  if (story.user != req.user.id) {
    res.redirect('/stories');
  } else {
    res.render('stories/edit', {
      story,
    });
  }
});

// @desc update story
// @route PUT /stories/:id

router.put('/:id', ensureAuth, async (req, res) => {
  let story = await Story.findById(req.params.id).lean();

  if (!story) {
    return res.render('error/404');
  }

  if (story.user != req.user.id) {
    res.redirect('/stories');
  } else {
    story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });

    res.redirect('/dashboard');
  }
});

module.exports = router;
