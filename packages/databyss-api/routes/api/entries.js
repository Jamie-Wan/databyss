const express = require('express')
const Entry = require('../../models/Entry')
const Author = require('../../models/Author')
const Source = require('../../models/Source')
const auth = require('../../middleware/auth')
const _ = require('lodash')
const helpers = require('./helpers/entriesHelper')

const router = express.Router()

const {
  appendEntryToSource,
  appendEntryToAuthors,
  appendAuthorToSource,
  // appendEntryToAuthorList,
  //  appendEntriesToSource,
  //  addAuthorId,
  //  addSourceId,
} = helpers

// @route    POST api/entry
// @desc     new Entry
// @access   Private
router.post('/', auth, async (req, res) => {
  try {
    /*
      INSERT ERROR HANDLER HERE
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
*/
    let { source } = req.body
    const {
      pageFrom,
      author,
      pageTo,
      files,
      entry,
      index,
      resource,
      firstName,
      lastName,
      _id, // NEED TO ADD THIS PARAM TO FRONT END
    } = req.body

    // If new source, create new Id
    if ((firstName || lastName) && !resource) {
      // POST NEW AUTHOR
      let authorPost
      authorPost = new Author({
        firstName,
        lastName,
        user: req.user.id,
      })
      authorPost = await authorPost.save()
      author.push(authorPost._id.toString())
    }

    if (resource) {
      let sourcePost
      let authorId
      if (firstName || lastName) {
        let authorPost
        // create new author
        authorPost = new Author({
          firstName,
          lastName,
          user: req.user.id,
        })
        authorPost = await authorPost.save()
        authorId = authorPost._id.toString()
        author.push(authorId)

        // create new souce
        const newSource = new Source({
          resource,
          user: req.user.id,
          authors: author,
        })
        sourcePost = await newSource.save()
        source = sourcePost._id.toString()

        // Update author with new source id
        authorPost = await Author.findOne({ _id: authorId })
        authorPost.sources = authorPost.sources.concat(source)
        authorPost = await Author.findOneAndUpdate(
          { _id: authorId },
          { $set: authorPost },
          { new: true }
        )
      } else {
        // create new source with or without existing author
        const newSource = new Source({
          resource,
          authors: !_.isEmpty(author) ? author : [],
          user: req.user.id,
        })
        sourcePost = await newSource.save()
        source = sourcePost._id.toString()

        // check to see if author exists
        if (_.isArray(author)) {
          appendAuthorToSource({ authors: author, sourceId: source })
        }
      }
    }

    const entryFields = {
      pageFrom: _.isEmpty(pageFrom) ? pageFrom : '',
      source: _.isEmpty(source) ? source : '',
      author: _.isEmpty(author) ? author : [],
      pageTo: _.isEmpty(pageTo) ? pageTo : '',
      files: _.isEmpty(files) ? files : [],
      entry,
      index: _.isEmpty(index) ? index : 0,
      user: req.user.id,
    }

    // CHECK HERE IF ENTRY EXISTS
    let entryExists = await Entry.findOne({ _id })
    if (entryExists) {
      if (req.user.id.toString() !== entryExists.user.toString()) {
        return res.status(401).json({ msg: 'This post is private' })
      }

      // update entry
      entryFields._id = _id
      entryExists = await Entry.findOneAndUpdate(
        { _id },
        { $set: entryFields }
      ).then(() => {
        // if source exists, append entry to source
        if (source) {
          appendEntryToSource({ sourceId: source, entryId: entryExists._id })
        }
        // if author exists, append entry to author
        if (author) {
          appendEntryToAuthors({ authors: author, entryId: entryExists._id })
        }
      })
    } else {
      // create new entry
      const entries = new Entry(entryFields)
      const post = await entries.save()

      // if source exists, append entry to source
      if (source) {
        appendEntryToSource({ sourceId: source, entryId: post._id })
      }
      // if author exists, append entry to author
      if (author) {
        appendEntryToAuthors({ authors: author, entryId: post._id })
      }
      return res.json(post)
    }
    return undefined
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server error')
  }
})

// @route    GET api/entry/:id
// @desc     Get entry by ID
// @access   Private

router.get('/:id', auth, async (req, res) => {
  try {
    /*
      INSERT ERROR HANDLER HERE
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
*/
    const entry = await Entry.findOne({
      _id: req.params.id,
    })

    if (!entry) {
      return res.status(400).json({ msg: 'There is no entry for this id' })
    }

    if (!entry.default) {
      if (req.user.id.toString() !== entry.user.toString()) {
        return res.status(401).json({ msg: 'This post is private' })
      }
    }

    return res.json(entry)
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})
// @route    GET api/entries/
// @desc     Get all entries
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const entry = await Entry.find()
      .or([{ user: req.user.id }, { default: true }])
      .limit(10)

    // const entry = await Entry.find({ user: req.user.id })
    if (!entry) {
      return res.status(400).json({ msg: 'There are no entries' })
    }

    // to migrate run command in order, one at a time
    // only run each function once
    // appendEntryToAuthorList(entry)
    // appendEntriesToSource(entry)
    // addAuthorId(entry)
    // addSourceId(entry)

    return res.json(entry)
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

module.exports = router
