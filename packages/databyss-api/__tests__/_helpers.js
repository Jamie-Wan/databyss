const request = require('supertest')
const app = require('./../app')

exports.noAuthPost = resource =>
  request(app)
    .post('/api/sources')
    .send({
      resource,
    })

exports.getUserInfo = token =>
  request(app)
    .get('/api/profile/me')
    .set('x-auth-token', token)
    .send()

exports.noAuthEntry = entry =>
  request(app)
    .post('/api/entries')
    .send({
      entry,
    })

exports.noAuthAuthor = (firstName, lastName) =>
  request(app)
    .post('/api/authors')
    .send({
      firstName,
      lastName,
    })

exports.createUser = async (email, password) => {
  let response = await request(app)
    .post('/api/users')
    .send({
      name: 'joe',
      password,
      email,
    })

  if (response.status === 400) {
    response = await request(app)
      .post('/api/auth')
      .send({
        password,
        email,
      })
  }
  return JSON.parse(response.text).token
}

exports.createSourceNoAuthor = (token, resource) =>
  request(app)
    .post('/api/sources')
    .set('x-auth-token', token)
    .send({
      resource,
    })

exports.createAuthor = (token, firstName, lastName) =>
  request(app)
    .post('/api/authors')
    .set('x-auth-token', token)
    .send({
      firstName,
      lastName,
    })

exports.getAuthor = (token, authorId) =>
  request(app)
    .get(`/api/authors/${authorId}`)
    .set('x-auth-token', token)

exports.createEntryNoSource = (token, entry) =>
  request(app)
    .post('/api/entries')
    .set('x-auth-token', token)
    .send({
      entry,
    })

exports.getEntryNoSource = (token, entryId) =>
  request(app)
    .get(`/api/entries/${entryId}`)
    .set('x-auth-token', token)

exports.createEntryNewSource = (token, entry, resource) =>
  request(app)
    .post('/api/entries')
    .set('x-auth-token', token)
    .send({
      entry,
      resource,
    })

exports.getEntryNewSource = (token, entryId) =>
  request(app)
    .get(`/api/entries/${entryId}`)
    .set('x-auth-token', token)

exports.getSourceNoAuthor = async (token, sourceNoAuthorId) =>
  request(app)
    .get(`/api/sources/${sourceNoAuthorId}`)
    .set('x-auth-token', token)

exports.createSourceWithAuthor = (token, resource, authorLastName) =>
  request(app)
    .post('/api/sources')
    .set('x-auth-token', token)
    .send({
      resource,
      authorLastName,
    })

exports.getSourceWithAuthor = async (token, sourceWithAuthorId) =>
  request(app)
    .get(`/api/sources/${sourceWithAuthorId}`)
    .set('x-auth-token', token)

exports.editedSourceWithAuthor = (token, resource, _id) =>
  request(app)
    .post(`/api/sources/`)
    .set('x-auth-token', token)
    .send({
      resource,
      _id,
    })

exports.getEditedSourceWithAuthor = (token, sourceId) =>
  request(app)
    .get(`/api/sources/${sourceId}`)
    .set('x-auth-token', token)

exports.deleteUserPosts = token =>
  request(app)
    .del(`/api/profile/`)
    .set('x-auth-token', token)

exports.createSourceWithId = (token, resource, sourceId) =>
  request(app)
    .post('/api/sources')
    .set('x-auth-token', token)
    .send({
      resource,
      _id: sourceId,
    })

exports.createEntryWithId = (token, entry, entryId) =>
  request(app)
    .post('/api/entries')
    .set('x-auth-token', token)
    .send({
      entry,
      _id: entryId,
    })

exports.createPage = (token, accountId, data) =>
  request(app)
    .post('/api/pages')
    .set('x-auth-token', token)
    .set('x-databyss-account', accountId)

    .send({
      data,
    })

exports.getPage = (token, accountId, _id) =>
  request(app)
    .get(`/api/pages/${_id}`)
    .set('x-auth-token', token)
    .set('x-databyss-account', accountId)

exports.createBlock = (token, _id, type, refId) =>
  request(app)
    .post('/api/blocks')
    .set('x-auth-token', token)
    .send({
      type,
      refId,
      _id,
    })

exports.getBlock = (token, _id) =>
  request(app)
    .get(`/api/blocks/${_id}`)
    .set('x-auth-token', token)

exports.getPopulatedPage = (token, accountId, _id) =>
  request(app)
    .get(`/api/pages/populate/${_id}`)
    .set('x-auth-token', token)
    .set('x-databyss-account', accountId)

exports.newAccountWithUserId = token =>
  request(app)
    .post('/api/accounts')
    .set('x-auth-token', token)
    .send()

exports.addUserToAccount = (token, _id, userId, role) =>
  request(app)
    .post(`/api/accounts/user/${userId}`)
    .set('x-auth-token', token)
    .set('x-databyss-account', _id)
    .send({
      role,
    })

exports.deleteUserFromAccount = (token, accountId, userId) =>
  request(app)
    .delete(`/api/accounts/${userId}`)
    .set('x-auth-token', token)
    .set('x-databyss-account', accountId)
